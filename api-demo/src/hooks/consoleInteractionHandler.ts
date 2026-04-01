import _ from 'lodash';

import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';

function buildInteractionMessage(req: FastifyRequest, rep: FastifyReply): string | null {
  const reqMethod = req.method;
  const reqMethodUpper = reqMethod.toUpperCase();
  const reqUrl = req.url;
  const reqUser = req.user;
  const reqBody = req.body;
  const route = req.routeOptions?.url;
  const {
    raw: {
      statusMessage: repStatusMessage,
    },
    statusCode: repStatusCode,
    elapsedTime,
    error: repErrBody,
  } = rep;

  // ignore OPTIONS requests
  if (reqMethodUpper === 'OPTIONS') return null;

  // ignore routes...
  if (reqUrl === '/health_eb') return null;
  if (reqUrl.match(/api-docs/)) return null;

  // req messages
  const reqRoute = `${reqMethodUpper} ${route || reqUrl}`;
  const reqMessage = `Request: ${reqMethodUpper} ${reqUrl}`;
  const reqBodyJson = _.isObject(reqBody) ? JSON.stringify(_.omit(reqBody, ['password'])) : '{}';
  const reqReturn = _.includes(['POST', 'PUT', 'PATCH', 'DELETE'], reqMethodUpper)
    ? `${reqMessage} => ${reqBodyJson}`
    : reqMessage;

  // set user email
  let userEmail = 'Not Set - Probably unauthenticated route';
  if (_.has(reqUser, 'email')) ({ email: userEmail } = reqUser);

  // res messages
  const resMessage = `Response: ${repStatusCode} ${repStatusMessage || ''}`.trim();

  const resErrBodyJson = _.isObject(repErrBody) ? JSON.stringify(repErrBody) : repErrBody;
  const resErrBodyMessage = `${resMessage}\nResponse Body: ${resErrBodyJson}`;
  const resReturn = repErrBody ? resErrBodyMessage : resMessage;

  const message = `\r\n
Route: ${reqRoute}
${reqReturn}
Request On: ${new Date().toISOString()}
User: ${userEmail}
${resReturn}
Response Time: ${(typeof elapsedTime === 'number' ? elapsedTime : 0).toFixed(0)}ms
\r\n-----------------------------------------------------------------------------\r\n`;

  return message;
};

function buildSentryInteractionMessage(req: FastifyRequest, rep: FastifyReply): string | null {
  const message = buildInteractionMessage(req, rep);

  if (!message) return null;

  // Minimal redaction: only redact long numeric sequences that might be sensitive
  return message.replace(/\b\d{10,16}\b/g, '[redacted-number]');
};

async function consoleInteractionHandler(req: FastifyRequest, rep: FastifyReply) {
  const message = buildInteractionMessage(req, rep);

  if (!message) return;

  console.log(message);
};

export {
  buildInteractionMessage,
  buildSentryInteractionMessage,
};

export default consoleInteractionHandler;
