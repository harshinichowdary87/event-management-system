const fastify = require('fastify')({ logger: true });
const listenMock = require('../mock-server');
const circuitBreaker = require('../utils/circuitBreaker');

fastify.get('/getUsers', async (request, reply) => {
    const resp = await fetch('http://event.com/getUsers');
    const data = await resp.json();
    reply.send(data); 
});

fastify.post('/addEvent', async (request, reply) => {
  try {
    const data = await circuitBreaker.execute(async () => {
      const resp = await fetch('http://event.com/addEvent', {
        method: 'POST',
        body: JSON.stringify({
          id: new Date().getTime(),
          ...request.body
        })
      });

      if (!resp.ok) {
        throw new Error(`External service returned ${resp.status}`);
      }

      return resp.json();
    });

    reply.send(data);
  } catch (err) {
    reply.code(503).send({
      success: false,
      error: 'Service temporarily unavailable'
    });
  }
});

fastify.get('/getEvents', async (request, reply) => {  
    const resp = await fetch('http://event.com/getEvents');
    const data = await resp.json();
    reply.send(data);
});

fastify.get('/getEventsByUserId/:id', async (request, reply) => {
  const { id } = request.params;

  const user = await fetch('http://event.com/getUserById/' + id);
  const userData = await user.json();

  const events = await Promise.all(
    userData.events.map(async (eventId) => {
      const event = await fetch(
        'http://event.com/getEventById/' + eventId
      );

      return event.json();
    })
  );

  reply.send(events);
});

fastify.listen({ port: 3000 }, (err) => {
    listenMock();
    if (err) {
      fastify.log.error(err);
      process.exit();
    }
});
