const controller = require('../controllers/eventController');

module.exports = function registerRoutes(fastify) {
  fastify.get('/getUsers', controller.getUsers);
  fastify.get('/getEvents', controller.getEvents);
  fastify.get('/getEventsByUserId/:id', controller.getEventsByUserId);
  fastify.post('/addEvent', controller.addEvent);
};
