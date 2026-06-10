const listenMock = require('../mock-server');
const { closeMock, handleAddEvent } = require('../mock-server');
const { create } = require('../utils/circuitBreaker');

describe('Integration: event API + circuit behavior (MSW)', () => {
  beforeAll(() => {
    listenMock();
  });

  afterAll(() => {
    closeMock();
  });

  test('first 5 addEvent requests succeed, subsequent requests fail and open circuit', async () => {
    const circuit = create({ failureThreshold: 3, failureWindow: 30000, resetTimeout: 30000, retryDelays: [10] });

    // first 5 should succeed according to mock-server logic
    for (let i = 1; i <= 5; i++) {
      const res = await circuit.execute(() => handleAddEvent({ id: `itest-${i}`, userId: 1, name: 'it' }));
      expect(res).toBeDefined();
      expect(res.success).toBe(true);
    }

    // next requests will fail; after 3 failures circuit should open
    await expect(circuit.execute(() => handleAddEvent({ id: `itest-6`, userId: 1 }))).rejects.toThrow();
    await expect(circuit.execute(() => handleAddEvent({ id: `itest-7`, userId: 1 }))).rejects.toThrow();
    await expect(circuit.execute(() => handleAddEvent({ id: `itest-8`, userId: 1 }))).rejects.toThrow();

    // circuit should now be open — subsequent attempts reject immediately
    await expect(circuit.execute(() => handleAddEvent({ id: `itest-9`, userId: 1 }))).rejects.toThrow('Circuit is open');
  }, 20000);
});
