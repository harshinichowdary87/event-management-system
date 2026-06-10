const { CircuitBreaker } = require('../utils/circuitBreaker');

describe('CircuitBreaker', () => {
  test('returns value on success', async () => {
    const cb = new CircuitBreaker();

    const result = await cb.execute(async () => {
      return 'ok';
    });

    expect(result).toBe('ok');
    expect(cb.state).toBe('CLOSED');
  });

  test('opens circuit after threshold failures', async () => {
    const cb = new CircuitBreaker();

    const failingFn = async () => {
      throw new Error('fail');
    };

    // cause failures
    await expect(cb.execute(failingFn)).rejects.toThrow();
    await expect(cb.execute(failingFn)).rejects.toThrow();
    await expect(cb.execute(failingFn)).rejects.toThrow();

    expect(cb.failures.length).toBeGreaterThanOrEqual(3);
    expect(cb.state).toBe('OPEN');
  });
});
