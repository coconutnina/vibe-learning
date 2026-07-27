import { NextRequest, NextResponse } from "next/server";
import { transcriptCache } from "@/lib/api-cache";
import {
  getTranscriptCache,
  setTranscriptCache,
} from "@/lib/supabase-cache";

const ERROR_MESSAGE = "无法获取字幕";
const SUPADATA_URL = "https://api.supadata.ai/v1/youtube/transcript";
const TIMEOUT_MS = 15000;

type TranscriptItem = { text: string; start: number; duration: number };

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } catch (error) {
      if (attempt === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(ERROR_MESSAGE);
}

async function fetchTranscriptFromSupadata(
  videoId: string
): Promise<TranscriptItem[]> {
  const apiKey = process.env.SUPADATA_API_KEY;
  if (!apiKey) {
    throw new Error("supadata_api_key_missing");
  }

  const response = await fetchWithRetry(
    `${SUPADATA_URL}?videoId=${encodeURIComponent(videoId)}&lang=en`,
    {
      headers: {
        "x-api-key": apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`supadata_api_error_${response.status}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ text?: string; offset?: number; duration?: number }>;
  };

  if (!Array.isArray(data.content)) {
    throw new Error("supadata_response_invalid");
  }

  return data.content.map((item) => ({
    text: typeof item.text === "string" ? item.text : "",
    start: typeof item.offset === "number" ? item.offset / 1000 : 0,
    duration: typeof item.duration === "number" ? item.duration / 1000 : 0,
  }));
}

function mergeTranscriptIntoSentences(
  transcript: { text: string; start: number; duration: number }[]
) {
  const merged: { text: string; start: number; duration: number }[] = [];
  let current: { text: string; start: number; duration: number } | null = null;

  for (const item of transcript) {
    if (!current) {
      current = { ...item };
      continue;
    }

    const trimmed = current.text.trim();
    const lastChar = trimmed.slice(-1);
    const isSentenceEnd = [".", "?", "!", ",", ";"].includes(lastChar);
    const isTooShort = trimmed.length < 80;

    if (!isSentenceEnd && isTooShort) {
      current.text = `${trimmed} ${item.text.trim()}`;
      current.duration = item.start - current.start + item.duration;
    } else {
      merged.push(current);
      current = { ...item };
    }
  }

  if (current) merged.push(current);
  return merged;
}

async function handleGetTranscript(videoIdRaw: string | undefined) {
  const videoId = videoIdRaw?.trim();
  if (!videoId) {
    return NextResponse.json({ error: ERROR_MESSAGE }, { status: 400 });
  }

  if (transcriptCache.has(videoId)) {
    const cached = transcriptCache.get(videoId);
    if (cached?.transcript && cached.transcript.length > 0) {
      return NextResponse.json(cached);
    }
    transcriptCache.delete(videoId);
  }

  const sharedTranscript = await getTranscriptCache(videoId);
  if (sharedTranscript && sharedTranscript.length > 0) {
    const cachedResult = { transcript: sharedTranscript };
    transcriptCache.set(videoId, cachedResult);
    return NextResponse.json(cachedResult);
  }

  try {
    const content = await fetchTranscriptFromSupadata(videoId);

    if (!Array.isArray(content) || content.length === 0) {
      // 明确返回空数组，才是真的没有字幕
      return NextResponse.json({ error: "no_subtitle" }, { status: 200 });
    }

    const transcript = content.map((item: TranscriptItem) => ({
      text: typeof item.text === "string" ? item.text : "",
      start: typeof item.start === "number" ? item.start : 0,
      duration: typeof item.duration === "number" ? item.duration : 0,
    }));

    const mergedTranscript = mergeTranscriptIntoSentences(
      transcript as { text: string; start: number; duration: number }[]
    );

    const result = { transcript: mergedTranscript };
    if (result.transcript && result.transcript.length > 0) {
      transcriptCache.set(videoId, result);
      await setTranscriptCache(videoId, result.transcript);
    }
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "timeout" }, { status: 408 });
    }
    console.error("Supadata error:", err);
    const message = err instanceof Error ? err.message : ERROR_MESSAGE;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handleGetTranscript(request.nextUrl.searchParams.get("videoId") ?? undefined);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { videoId?: string }
    | null;
  return handleGetTranscript(body?.videoId);
}
