class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.failureWindow = options.failureWindow || 30000;
    this.resetTimeout = options.resetTimeout || 30000;
    this.retryDelays = options.retryDelays || [100, 200, 400];

    this.state = 'CLOSED';
    this.failures = [];
    this.nextAttempt = 0;
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  recordFailure() {
    const now = Date.now();

    this.failures.push(now);

    this.failures = this.failures.filter(
      (timestamp) => now - timestamp <= this.failureWindow
    );

    if (this.failures.length >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = now + this.resetTimeout;
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

    for (let attempt = 0; attempt <= this.retryDelays.length; attempt++) {
      try {
        const result = await fn();

        this.recordSuccess();

        return result;
      } catch (err) {
        if (attempt < this.retryDelays.length) {
          await this.sleep(this.retryDelays[attempt]);
          continue;
        }

        this.recordFailure();

        if (this.state === 'HALF_OPEN') {
          this.state = 'OPEN';
          this.nextAttempt = Date.now() + this.resetTimeout;
        }

        throw err;
      }
    }
  }
}

// default singleton for backward compatibility
const defaultInstance = new CircuitBreaker();

module.exports = defaultInstance;
module.exports.CircuitBreaker = CircuitBreaker;
module.exports.create = (opts) => new CircuitBreaker(opts);