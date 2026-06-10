const metrics = {
  startTime: Date.now(),
  requests: 0,
  routes: {},
  errors: 0,
  incRequest(route) {
    this.requests += 1;
    const key = route || 'unknown';
    this.routes[key] = (this.routes[key] || 0) + 1;
  },
  incError() {
    this.errors += 1;
  },
  getMetrics() {
    return {
      uptimeMs: Date.now() - this.startTime,
      requests: this.requests,
      routes: this.routes,
      errors: this.errors
    };
  }
};

module.exports = metrics;
