---
title: "Observability Patterns for Microservices"
date: "2020-09-05"
description: "Practical patterns for implementing the three pillars of observability in a microservices architecture."
tags: ["observability", "microservices", "devops", "monitoring"]
---

Moving from a monolith to microservices taught us that observability isn't optional - it's essential. When a request touches ten services, you need visibility into each hop. Here are the patterns that worked for us.

## The Three Pillars

**Logs** - Discrete events that happened
**Metrics** - Aggregated measurements over time
**Traces** - The journey of a single request

All three are necessary. None alone is sufficient.

## Structured Logging

The key insight: logs are data, not strings.

```python
# Bad: Unstructured log
logger.info(f"User {user_id} created order {order_id} for ${amount}")

# Good: Structured log
logger.info("order_created", extra={
    "user_id": user_id,
    "order_id": order_id,
    "amount_cents": amount_cents,
    "items_count": len(items),
    "trace_id": get_current_trace_id()
})
```

Structured logs can be queried:

```sql
-- Find all high-value orders that took > 5s
SELECT * FROM logs
WHERE event = 'order_created'
  AND amount_cents > 100000
  AND duration_ms > 5000
```

## Metrics with Context

We use the RED method for services:

- **R**ate - Requests per second
- **E**rrors - Failed requests per second
- **D**uration - Distribution of request latencies

```python
from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint'],
    buckets=[.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10]
)

@app.middleware
async def metrics_middleware(request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start

    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.path,
        status=response.status_code
    ).inc()

    REQUEST_LATENCY.labels(
        method=request.method,
        endpoint=request.path
    ).observe(duration)

    return response
```

## Distributed Tracing

Traces tie everything together. Every request gets a trace ID that propagates across services:

```
Trace: abc-123
├── api-gateway (50ms)
│   ├── auth-service (10ms)
│   └── order-service (35ms)
│       ├── inventory-check (15ms)
│       └── payment-service (18ms)
```

The trace ID must propagate through:

- HTTP headers (`X-Trace-ID`)
- Message queue metadata
- Async job contexts
- Log entries

## Correlation is Key

The real power comes when you can correlate across pillars:

1. Alert fires: "P99 latency > 500ms"
2. Check metrics: Latency spike started at 14:32
3. Query traces: Find slow traces from that time
4. Read logs: Identify the slow database query
5. Fix: Add missing index

Without correlation, each pillar is just noise.
