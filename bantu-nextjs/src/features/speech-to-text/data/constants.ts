export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export const SUPPORTED_AUDIO_FORMATS = [
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/flac",
  "audio/ogg",
  "audio/webm",
] as const;

export const SUPPORTED_EXTENSIONS = [
  ".wav",
  ".mp3",
  ".m4a",
  ".flac",
  ".ogg",
  ".webm",
] as const;

export const ACCEPT_STRING = SUPPORTED_EXTENSIONS.join(",");
