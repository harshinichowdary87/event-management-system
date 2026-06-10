const eventService = require('../services/eventService');

async function getUsers(request, reply) {
  const data = await eventService.getUsers();
  reply.send(data);
}

async function addEvent(request, reply) {
  try {
    const data = await eventService.addEvent(request.body);
    reply.send(data);
  } catch (err) {
    reply.code(503).send({ success: false, error: 'Service temporarily unavailable' });
  }
}

async function getEvents(request, reply) {
  const data = await eventService.getEvents();
  reply.send(data);
}

async function getEventsByUserId(request, reply) {
  const { id } = request.params;
  const data = await eventService.getEventsByUserId(id);
  reply.send(data);
}

module.exports = {
  getUsers,
  addEvent,
  getEvents,
  getEventsByUserId
};
