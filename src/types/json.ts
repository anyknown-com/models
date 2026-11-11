export type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

export type JsonObject = { [k: string]: JsonValue };
