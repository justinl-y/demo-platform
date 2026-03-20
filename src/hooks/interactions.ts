import _ from 'lodash';

import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';

const consoleInteractionHandler = async (req: FastifyRequest, rep: FastifyReply) => {
  const {
    method: reqMethod,
    url: reqUrl,
    user: reqUser,
    body: reqBody,
    routeOptions: {
      url: route,
    },
  } = req;
  const {
    raw: {
      statusMessage: repStatusMessage,
    },
    statusCode: repStatusCode,
    elapsedTime,
    error: repErrBody,
  } = rep;

  // ignore OPTIONS requests
  if (reqMethod.toUpperCase() === 'OPTIONS') return;

  // ignore health_check requests
  if (reqUrl === '/health_eb') return;

  // req messages
  const reqRoute = `${reqMethod.toUpperCase()} ${route}`;
  const reqMessage = `Request: ${reqMethod.toUpperCase()} ${reqUrl}`;
  const reqBodyJson = _.isObject(reqBody) ? JSON.stringify(_.omit(reqBody, ['password'])) : '{}';

  const reqReturn = (_.includes(['POST', 'PUT', 'PATCH', 'DELETE'], reqMethod.toUpperCase())) ? `${reqMessage} => ${reqBodyJson}` : `${reqMessage}`;

  // set user email
  let userEmail = 'Not Set - Probably unauthenticated route';
  if (_.has(reqUser, 'email')) ({ email: userEmail } = reqUser);

  // res messages
  const resMessage = `Response: ${repStatusCode} ${repStatusMessage}`;

  const resErrBodyMessage
= `${resMessage}
Response Body: ${repErrBody}`;

  const resReturn = (repErrBody) ? resErrBodyMessage : `${resMessage}`;

  const message
= `\r\n
Route: ${reqRoute}
${reqReturn}
Request On: ${new Date().toISOString()}
User: ${userEmail}
${resReturn}
Response Time: ${elapsedTime.toFixed(0)}ms
\r\n-----------------------------------------------------------------------------\r\n`;

  console.log(message);
};

export default consoleInteractionHandler;
