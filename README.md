# Notes

I focused on the two issues mentioned in the task: performance and resilience.

### Performance

The main performance issue was in the `/getEventsByUserId` endpoint.

The endpoint retrieves a user first and then loads all events associated with that user. Originally, each event was fetched one after another. Since the mock event API has an intentional delay, the response time increased as more events were added.

I updated the implementation to fetch all events in parallel using `Promise.all()`.

Since the event requests are independent of each other, they do not need to wait for the previous request to complete. Running them in parallel significantly reduces the overall response time.

While testing locally, the endpoint took around 3.5 seconds when a user had multiple events. After the change, the same request completed in about 0.5 seconds.

### Resilience

The `/addEvent` endpoint depends on an external service. The mock service is configured to start failing after a certain number of requests.

In the original implementation, every request continued calling the external service even when it was already failing. This can create additional pressure on an unhealthy dependency.

I added a circuit breaker along with a retry mechanism using exponential backoff.

The circuit breaker tracks repeated failures and temporarily stops sending requests to the external service once the failure threshold is reached. After a cooldown period, requests are allowed again to check whether the service has recovered.

The retry mechanism helps handle temporary failures before marking the request as failed.

When the external service is unavailable, the API now returns a clear response:

```json
{
  "success": false,
  "error": "Service temporarily unavailable"
}
```

### Repository Changes

Added:

* `utils/circuitBreaker.js`

Updated:

* `/getEventsByUserId` to fetch events in parallel.
* `/addEvent` to use circuit breaker protection and retries.
