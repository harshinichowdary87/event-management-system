const FAILURE_THRESHOLD = 3;
const FAILURE_WINDOW = 30000;
const RESET_TIMEOUT = 30000;

class CircuitBreaker {
  constructor() {
    this.state = 'CLOSED';
    this.failures = [];
    this.nextAttempt = 0;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  recordFailure() {
    const now = Date.now();

    this.failures.push(now);

    this.failures = this.failures.filter(
      timestamp => now - timestamp <= FAILURE_WINDOW
    );

    if (this.failures.length >= FAILURE_THRESHOLD) {
      this.state = 'OPEN';
      this.nextAttempt = now + RESET_TIMEOUT;
    }
  }

  recordSuccess() {
    this.failures = [];
    this.state = 'CLOSED';
  }

  async execute(fn) {
    const now = Date.now();

    if (this.state === 'OPEN') {
      if (now < this.nextAttempt) {
        throw new Error('Circuit is open');
      }

      this.state = 'HALF_OPEN';
    }

    const delays = [100, 200, 400];

    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        const result = await fn();

        this.recordSuccess();

        return result;
      } catch (err) {
        if (attempt < delays.length) {
          await this.sleep(delays[attempt]);
          continue;
        }

        this.recordFailure();

        if (this.state === 'HALF_OPEN') {
          this.state = 'OPEN';
          this.nextAttempt = Date.now() + RESET_TIMEOUT;
        }

        throw err;
      }
    }
  }
}

module.exports = new CircuitBreaker();