import { IMAGE_SIGNATURES } from "../wire/image-signatures";
import type { Signatures } from "./types";

export const PROVIDER = "bedrock";

// https://docs.aws.amazon.com/transcribe/latest/dg/streaming-setting-up.html#streaming-event-stream
export const PRELUDE_LENGTH = 12;

export const PRELUDE_CRC_AT = 8;

export const CRC_LENGTH = 4;

export const STRING_TYPE = 7;

export const LENGTH_PREFIXED_TYPES: readonly number[] = [6, STRING_TYPE];

export const FIXED_VALUE_LENGTHS: Readonly<Record<number, number>> = {
  0: 0,
  1: 0,
  2: 1,
  3: 2,
  4: 4,
  5: 8,
  8: 8,
  9: 16,
};

export const CRC32_POLYNOMIAL = 0xedb88320;

export const MAX_TOKENS_BESIDE_THINKING = 4096;

export const ANTHROPIC_RESPONSE_FIELD_PATHS = ["/delta/stop_sequence"];

export const MISTRAL_TOOL_USE_ID_LENGTH = 9;

export const IMAGE_FORMATS: Readonly<Record<string, string>> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

// https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_DocumentBlock.html
export const DOCUMENT_FORMATS: Readonly<Record<string, string>> = {
  "application/pdf": "pdf",
  "text/csv": "csv",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/html": "html",
  "text/plain": "txt",
  "text/markdown": "md",
};

// https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_VideoBlock.html
export const VIDEO_FORMATS: Readonly<Record<string, string>> = {
  "video/x-matroska": "mkv",
  "video/quicktime": "mov",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/x-flv": "flv",
  "video/mpeg": "mpeg",
  "video/mpg": "mpg",
  "video/wmv": "wmv",
  "video/x-ms-wmv": "wmv",
  "video/3gpp": "three_gp",
};

export const SIGNATURES_BY_TOP_LEVEL: Readonly<Record<string, Signatures>> = {
  image: IMAGE_SIGNATURES,
  video: [
    ["video/mp4", [0x00, 0x00, 0x00, null, 0x66, 0x74, 0x79, 0x70]],
    ["video/webm", [0x1a, 0x45, 0xdf, 0xa3]],
    ["video/x-msvideo", [0x52, 0x49, 0x46, 0x46]],
  ],
  application: [["application/pdf", [0x25, 0x50, 0x44, 0x46]]],
};
