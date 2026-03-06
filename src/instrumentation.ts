import { registerOTel } from "@vercel/otel";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  // Dynamic require to prevent webpack from bundling this Node.js-only package.
  // PrometheusExporter uses the built-in `http` module which isn't available
  // in webpack's module resolution.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrometheusExporter } = require("@opentelemetry/exporter-prometheus");

  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  const metricsPort = parseInt(process.env.OTEL_METRICS_PORT || "9464", 10);

  registerOTel({
    serviceName: "mattjmcnaughton-blog",
    traceExporter: new OTLPTraceExporter({
      url: endpoint ? `${endpoint}/v1/traces` : undefined,
    }),
    metricReaders: [
      new PrometheusExporter({
        port: metricsPort,
      }),
    ],
  });
}
