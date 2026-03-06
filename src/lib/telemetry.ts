import { trace, metrics, type Span, SpanStatusCode } from "@opentelemetry/api";

const TRACER_NAME = "mattjmcnaughton-blog";
const METER_NAME = "mattjmcnaughton-blog";

export function getTracer() {
  return trace.getTracer(TRACER_NAME);
}

export function getMeter() {
  return metrics.getMeter(METER_NAME);
}

export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  return getTracer().startActiveSpan(name, async (span) => {
    if (attributes) {
      span.setAttributes(attributes);
    }
    try {
      const result = await fn(span);
      return result;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      if (error instanceof Error) {
        span.recordException(error);
      }
      throw error;
    } finally {
      span.end();
    }
  });
}

let _feedCounter: ReturnType<ReturnType<typeof getMeter>["createCounter"]>;

export function feedRequestCounter() {
  if (!_feedCounter) {
    _feedCounter = getMeter().createCounter("feed.requests", {
      description: "Number of RSS feed requests",
    });
  }
  return _feedCounter;
}
