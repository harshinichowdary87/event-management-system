const fetch = global.fetch || require('node-fetch');

async function getUsers() {
  const resp = await fetch('http://event.com/getUsers');
  return resp.json();
}

async function getUserById(id) {
  const resp = await fetch('http://event.com/getUserById/' + id);
  return resp.json();
}

async function addEvent(event) {
  const resp = await fetch('http://event.com/addEvent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    const err = new Error(`External service returned ${resp.status}`);
    err.body = body;
    throw err;
  }

  return resp.json();
}

async function getEvents() {
  const resp = await fetch('http://event.com/getEvents');
  return resp.json();
}

async function getEventById(id) {
  const resp = await fetch('http://event.com/getEventById/' + id);
  return resp.json();
}

module.exports = {
  getUsers,
  getUserById,
  addEvent,
  getEvents,
  getEventById
};
