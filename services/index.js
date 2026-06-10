const fastify = require('fastify')({ logger: true });
const listenMock = require('../mock-server');
const registerRoutes = require('../routes/eventRoutes');
const metrics = require('../utils/metrics');
const { logger } = require('../utils/logger');

// collect basic metrics and structured logs
fastify.addHook('onRequest', (request, reply, done) => {
  try {
    const route = request.routerPath || request.raw.url;
    metrics.incRequest(route);
    logger.info('incoming request', { method: request.raw.method, url: request.raw.url });
  } catch (e) {
    logger.error('metrics onRequest error', e);
  }
  done();
});

fastify.addHook('onResponse', (request, reply, done) => {
  try {
    if (reply.statusCode >= 500) metrics.incError();
  } catch (e) {
    logger.error('metrics onResponse error', e);
  }
  done();
});

// register application routes (controllers handle service calls)
registerRoutes(fastify);

fastify.get('/', async (request, reply) => {
  reply.send({
    success: true,
    message: 'Event management API',
    routes: ['/getUsers', '/getEvents', '/getEventsByUserId/:id', '/addEvent', '/health', '/metrics']
  });
});

// health and metrics endpoints
fastify.get('/health', async () => ({ status: 'ok', uptimeMs: Date.now() - metrics.startTime }));
fastify.get('/metrics', async () => metrics.getMetrics());

fastify.listen({ port: 3000 }, (err) => {
  listenMock();
  if (err) {
    fastify.log.error(err);
    process.exit();
  }
});
