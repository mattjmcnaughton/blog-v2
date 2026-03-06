# Instrumentation

## Overview

The blog is instrumented with OpenTelemetry (OTel) for distributed tracing and metrics.

**What's instrumented:**

- **Custom spans** in the markdown processing pipeline (`src/lib/markdown.ts`) and RSS feed generation (`src/app/feed/route.ts`) via the `withSpan` helper
- **Auto-instrumented** Next.js HTTP routes (provided by `@vercel/otel`)
- **Custom metrics** — `feed.requests` counter tracking RSS feed hits

## Architecture

```
Next.js app (host)
  │
  │  OTLP HTTP push (:4318)        Prometheus scrape (:9464)
  │───────────────────┐  ┌──────────────────────│
  ▼                   │  │                      ▼
Tempo (traces)        │  │              Prometheus (metrics)
  │                   │  │                      │
  └─────────┐   ┌────┘  └────┐   ┌─────────────┘
            ▼   ▼            ▼   ▼
            Grafana (UI, :3300)
```

- **Traces**: pushed via OTLP HTTP directly to Tempo
- **Metrics**: exposed via Prometheus exporter on `:9464/metrics`, scraped by Prometheus

The app's `src/instrumentation.ts` uses `@vercel/otel` to register exporters. Traces are pushed to `OTEL_EXPORTER_OTLP_ENDPOINT` when set (silently dropped when unset). Metrics are always exposed on the Prometheus scrape port (default `9464`, configurable via `OTEL_METRICS_PORT`).

## Key files

| File                                                       | Purpose                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/instrumentation.ts`                                   | OTel SDK registration (trace + metric exporters)                   |
| `src/lib/telemetry.ts`                                     | Helpers: `withSpan`, `getTracer`, `getMeter`, `feedRequestCounter` |
| `docker-compose.yml`                                       | Local observability stack (Tempo + Prometheus + Grafana)           |
| `docker/tempo/tempo.yaml`                                  | Tempo trace storage config                                         |
| `docker/prometheus/prometheus.yaml`                        | Prometheus scrape config                                           |
| `docker/grafana/provisioning/datasources/datasources.yaml` | Grafana datasource provisioning                                    |

## Local development

### Start the observability stack

```bash
just obs-up
```

This starts Tempo, Prometheus, and Grafana via Docker Compose.

### Run the dev server with instrumentation

```bash
just dev-instrumented
```

This starts both the observability stack and the Next.js dev server with `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`.

### View traces

1. Open Grafana at [http://localhost:3300](http://localhost:3300)
2. Go to **Explore** (compass icon in the sidebar)
3. Select **Tempo** as the datasource
4. Search for traces from `mattjmcnaughton-blog`

### View metrics

1. Open Grafana at [http://localhost:3300](http://localhost:3300)
2. Go to **Explore** (compass icon in the sidebar)
3. Select **Prometheus** as the datasource
4. Query metrics like `feed_requests_total`

You can also view raw metrics directly at [http://localhost:9464/metrics](http://localhost:9464/metrics) when the dev server is running.

### Stop the stack

```bash
just obs-down
```

## Production

**No OTLP endpoint is configured in production yet.** The instrumentation code runs but trace data is silently dropped since `OTEL_EXPORTER_OTLP_ENDPOINT` is not set. The Prometheus metrics endpoint is exposed but not scraped.

When a collector becomes available, configure the endpoint:

```bash
fly secrets set OTEL_EXPORTER_OTLP_ENDPOINT=https://<collector-endpoint>
```
