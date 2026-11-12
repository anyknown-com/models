import { ERROR_STATUSES } from "./constants.mjs";
import { messageOf } from "./message-of.mjs";
import { redactAccounts } from "./redact-accounts.mjs";

const statusFits = (id, status) =>
  ERROR_STATUSES[id]?.includes(status) ?? (status >= 200 && status < 300);

const today = () => new Date().toISOString().slice(0, 10);

const notFoundReason = (model, status, message) =>
  `answers the unknown model id ${model} with ${status} ${JSON.stringify(message)}, never 404 (recorded ${today()})`;

export function judgeCall(textCase, call, { requestOnly, secrets }) {
  const fixture = { request: call.request, response: redactAccounts(call.response) };

  if (requestOnly) return { fixture: { unverified: true, ...fixture } };

  const { status } = call.response;

  if (statusFits(textCase.id, status)) return { fixture };

  const message = messageOf(call.response, secrets);

  if (textCase.id === "error-not-found") {
    return { unsupported: notFoundReason(textCase.request.model, status, message) };
  }

  return { failure: `${textCase.id} ${status}: ${message}` };
}
