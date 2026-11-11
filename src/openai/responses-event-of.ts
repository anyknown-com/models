import type { ModelError } from "../model-error";
import { fieldOf } from "../speech/field-of";
import { typedDataOf } from "../wire/typed-data-of";
import type { ReadField } from "../wire/types";
import { READ_FIELDS, TYPE_FIELDS } from "./constants";
import type { ResponsesEvent } from "./types";

const readFieldsOf = (event: unknown): readonly ReadField[] => {
  const type = fieldOf(event, "type");

  return (typeof type === "string" && READ_FIELDS[type]) || TYPE_FIELDS;
};

export const responsesEventOf = (provider: string, data: string): ResponsesEvent | ModelError =>
  typedDataOf<ResponsesEvent>(provider, data, readFieldsOf);
