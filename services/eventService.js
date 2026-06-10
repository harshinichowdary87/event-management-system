const eventApi = require('../adapters/eventApi');
const circuitFactory = require('../utils/circuitBreaker');

// create a circuit breaker specific to the event API
const eventCircuit = circuitFactory.create({
  failureThreshold: 3,
  failureWindow: 30000,
  resetTimeout: 30000,
  retryDelays: [100, 200, 400]
});

async function getUsers() {
  return eventApi.getUsers();
}

async function addEvent(payload) {
  return eventCircuit.execute(async () => {
    return eventApi.addEvent(payload);
  });
}

async function getEvents() {
  return eventApi.getEvents();
}

async function getEventsByUserId(id) {
  const user = await eventApi.getUserById(id);

  const events = await Promise.all(
    (user.events || []).map((eventId) => eventApi.getEventById(eventId))
  );

  return events;
}

module.exports = {
  getUsers,
  addEvent,
  getEvents,
  getEventsByUserId
};
