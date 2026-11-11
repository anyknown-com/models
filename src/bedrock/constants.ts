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
