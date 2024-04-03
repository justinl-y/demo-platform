import Fastify from 'fastify';

const fastify = Fastify({
  logger: true
});

const LOCAL_HOST = '0.0.0.0';
const LOCAL_PORT = 8000;

fastify.get('/', async (request, reply) => {

  // console.log(request);

  reply
    .send({ hello: 'world' });

});

fastify.get('/health_check', async (request, reply) => {

  const message = {
    status: 'OK',
    message: 'I\'m alive!'
  };

  reply
    .code(200)
    .send(message);

});

const start = async () => {

  try {

    await fastify.listen({ host: LOCAL_HOST, port: LOCAL_PORT });

    console.log(`Server listening on: http://${LOCAL_HOST}:${LOCAL_PORT}`);
    console.log(`Node.js Version: ${process.version}`);

  }
  catch (err) {

    fastify.log.error(err);
    process.exit(1);

  }

};

start();
