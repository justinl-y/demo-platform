import _ from 'lodash';

import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';

type InteractionData = {
  route: string;
  request: string;
  requestOn: string;
  user: string;
  response: string;
  responseBody?: string;
  responseTime: string;
};

// Minimal redaction: only redact long numeric sequences that might be sensitive
const REDACT_PATTERN = /\b\d{10,16}\b/g;

function redact(value: string): string {
  return value.replace(REDACT_PATTERN, '[redacted-number]');
}

type InteractionFields = {
  reqMethodUpper: string;
  reqUrl: string;
  reqRoute: string;
  requestLine: string;
  userEmail: string;
  requestOn: string;
  repStatusCode: number;
  repStatusMessage: string;
  elapsedMs: number;
  repErrBody: unknown;
  resErrBodyJson: string | null;
};

function extractInteractionFields(request: FastifyRequest, reply: FastifyReply): InteractionFields | null {
  const reqMethodUpper = request.method.toUpperCase();
  const reqUrl = request.url;

  if (reqMethodUpper === 'OPTIONS') return null;
  if (reqUrl === '/health_eb') return null;
  if (reqUrl.match(/api-docs/)) return null;

  const reqUser = request.user;
  const reqBody = request.body;
  const route = request.routeOptions?.url;
  const {
    raw: {
      statusMessage: repStatusMessage,
    },
    statusCode: repStatusCode,
    elapsedTime,
    error: repErrBody,
  } = reply;

  const reqBodyJson = _.isObject(reqBody) ? JSON.stringify(_.omit(reqBody, ['password'])) : '{}';
  const isMutating = _.includes(['POST', 'PUT', 'PATCH', 'DELETE'], reqMethodUpper);

  let userEmail = 'Not Set';
  if (_.has(reqUser, 'email')) ({ email: userEmail } = reqUser);

  return {
    reqMethodUpper,
    reqUrl,
    reqRoute: `${reqMethodUpper} ${route || reqUrl}`,
    requestLine: isMutating ? `${reqMethodUpper} ${reqUrl} => ${reqBodyJson}` : `${reqMethodUpper} ${reqUrl}`,
    userEmail,
    requestOn: new Date().toISOString(),
    repStatusCode,
    repStatusMessage: repStatusMessage || '',
    elapsedMs: typeof elapsedTime === 'number' ? elapsedTime : 0,
    repErrBody,
    resErrBodyJson: repErrBody
      ? (_.isObject(repErrBody) ? JSON.stringify(repErrBody) : String(repErrBody))
      : null,
  };
}

function buildInteractionMessage(request: FastifyRequest, reply: FastifyReply): string | null {
  const fields = extractInteractionFields(request, reply);

  if (!fields) return null;

  const { reqRoute, requestLine, userEmail, requestOn, repStatusCode, repStatusMessage, elapsedMs, repErrBody, resErrBodyJson } = fields;

  const resMessage = `Response: ${repStatusCode} ${repStatusMessage}`.trim();
  const resReturn = repErrBody ? `${resMessage}\nResponse Body: ${resErrBodyJson}` : resMessage;

  return `\r\n
Route: ${reqRoute}
Request: ${requestLine}
Request On: ${requestOn}
User: ${userEmail}
${resReturn}
Response Time: ${elapsedMs.toFixed(0)}ms
\r\n-----------------------------------------------------------------------------\r\n`;
}

function buildInteractionData(request: FastifyRequest, reply: FastifyReply): InteractionData | null {
  const fields = extractInteractionFields(request, reply);

  if (!fields) return null;

  const { reqRoute, requestLine, userEmail, requestOn, repStatusCode, repStatusMessage, elapsedMs, repErrBody, resErrBodyJson } = fields;

  const data: InteractionData = {
    route: redact(reqRoute),
    request: redact(requestLine),
    requestOn,
    user: redact(userEmail),
    response: `${repStatusCode} ${repStatusMessage}`.trim(),
    responseTime: `${elapsedMs.toFixed(0)}ms`,
  };

  if (repErrBody && resErrBodyJson) data.responseBody = redact(resErrBodyJson);

  return data;
}

async function consoleInteractionHandler(request: FastifyRequest, reply: FastifyReply) {
  const message = buildInteractionMessage(request, reply);

  if (!message) return;

  request.log.info(message);
}

export {
  buildInteractionMessage,
  buildInteractionData,
};
export type { InteractionData };

export default consoleInteractionHandler;
