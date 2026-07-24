import {
	createNoOpProvider,
	register,
	type NodeTracerProvider,
	type RegisterParams,
} from "@arizeai/phoenix-otel";
import {
	redactTelemetryMetadata,
	type GenerationTelemetry,
} from "./redaction.ts";

type SpanProcessor = NonNullable<RegisterParams["spanProcessors"]>[number];

export type InMemoryGenerationSpan = Readonly<{
	name: string;
	attributes: Readonly<Record<string, unknown>>;
}>;

export function createInMemoryGenerationExporter(): {
	processor: SpanProcessor;
	spans: InMemoryGenerationSpan[];
} {
	const spans: InMemoryGenerationSpan[] = [];
	const processor: SpanProcessor = {
		onStart: () => undefined,
		onEnd: (span) => {
			spans.push({
				name: span.name,
				attributes: { ...span.attributes },
			});
		},
		forceFlush: async () => undefined,
		shutdown: async () => undefined,
	};
	return { processor, spans };
}

export function registerGenerationTelemetry(options: {
	enabled: boolean;
	spanProcessors?: SpanProcessor[];
}): {
	record: (event: GenerationTelemetry) => void;
	shutdown: () => Promise<void>;
} {
	const provider: NodeTracerProvider = options.enabled
		? register({
				projectName: "model-afterlife",
				global: false,
				spanProcessors: options.spanProcessors,
			})
		: createNoOpProvider();
	const tracer = provider.getTracer("model-afterlife-generation");
	return {
		record: (event) => {
			const span = tracer.startSpan("generation.attempt");
			span.setAttributes(redactTelemetryMetadata(event));
			span.end();
		},
		shutdown: async () => {
			await provider.forceFlush();
			await provider.shutdown();
		},
	};
}
