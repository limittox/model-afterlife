import { z } from "zod";

export const PUBLIC_WORLD_SCHEMA_VERSION = 1 as const;

const RoomSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
});

const ResidentSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	role: z.string().min(1),
	visualVariantId: z.string().min(1),
	roomId: z.string().min(1),
	activity: z.string().min(1),
});

const DialogueTurnSchema = z.object({
	id: z.string().min(1),
	speakerId: z.string().min(1),
	exactModelId: z.string().min(1),
	text: z.string().min(1),
});

const CompleteSceneSchema = z.object({
	id: z.string().min(1),
	premise: z.string().min(1),
	locationId: z.string().min(1),
	participantIds: z.array(z.string().min(1)).min(2).max(3),
	startedAtTick: z.number().int().nonnegative(),
	durationTicks: z.number().int().positive(),
	presentationDurationMs: z.number().int().positive(),
	turns: z.array(DialogueTurnSchema).min(4).max(10),
	deliveryMode: z.enum(["live", "cached"]).default("live"),
	originalRevisionId: z.string().min(1).optional(),
	originalSceneKey: z.string().min(1).optional(),
}).superRefine((scene, context) => {
	if (
		scene.deliveryMode === "cached" &&
		(!scene.originalRevisionId || !scene.originalSceneKey)
	) {
		context.addIssue({
			code: "custom",
			message: "Cached scenes must preserve original revision provenance.",
			path: ["originalRevisionId"],
		});
	}
});

const QuietStatusSchema = z.object({
	reason: z.enum(["between-scenes", "scene-unavailable"]),
	locationId: z.string().min(1),
	message: z.string().min(1),
});

export const PublicWorldSnapshotSchema = z
	.object({
		schemaVersion: z.literal(PUBLIC_WORLD_SCHEMA_VERSION),
		worldId: z.string().uuid(),
		logicalTick: z.number().int().nonnegative(),
		homeTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
		dayPeriod: z.enum(["morning", "afternoon", "evening", "night"]),
		throughSequence: z.number().int().positive(),
		stateHash: z.string().regex(/^[a-f0-9]{64}$/),
		rooms: z.array(RoomSchema).min(1),
		residents: z.array(ResidentSchema).length(6),
		scene: CompleteSceneSchema.nullable(),
		quiet: QuietStatusSchema.nullable(),
	})
	.superRefine((snapshot, context) => {
		if ((snapshot.scene === null) === (snapshot.quiet === null)) {
			context.addIssue({
				code: "custom",
				message:
					"A snapshot must contain exactly one complete scene or quiet status.",
				path: ["scene"],
			});
		}
		for (const field of ["id", "name", "role", "visualVariantId"] as const) {
			if (
				new Set(snapshot.residents.map((resident) => resident[field])).size !==
				snapshot.residents.length
			) {
				context.addIssue({
					code: "custom",
					message: `Public resident ${field} values must be unique.`,
					path: ["residents"],
				});
			}
		}
	});

export type PublicWorldSnapshot = z.infer<typeof PublicWorldSnapshotSchema>;

export const PublicWorldUpdateSchema = z
	.object({
		schemaVersion: z.literal(PUBLIC_WORLD_SCHEMA_VERSION),
		sequence: z.number().int().positive(),
		logicalTick: z.number().int().nonnegative(),
		stateHash: z.string().regex(/^[a-f0-9]{64}$/),
		snapshot: PublicWorldSnapshotSchema,
	})
	.superRefine((update, context) => {
		for (const [field, matches] of [
			["sequence", update.sequence === update.snapshot.throughSequence],
			["logicalTick", update.logicalTick === update.snapshot.logicalTick],
			["stateHash", update.stateHash === update.snapshot.stateHash],
		] as const) {
			if (!matches) {
				context.addIssue({
					code: "custom",
					message: `Update ${field} must match its snapshot.`,
					path: [field],
				});
			}
		}
	});

export const PublicWorldUpdatesSchema = z
	.object({
		schemaVersion: z.literal(PUBLIC_WORLD_SCHEMA_VERSION),
		fromSequence: z.number().int().nonnegative(),
		throughSequence: z.number().int().nonnegative(),
		hasMore: z.boolean(),
		requiresSnapshot: z.boolean(),
		updates: z.array(PublicWorldUpdateSchema).max(100),
	})
	.superRefine((envelope, context) => {
		if (envelope.requiresSnapshot) {
			if (envelope.updates.length > 0 || envelope.hasMore) {
				context.addIssue({
					code: "custom",
					message: "Snapshot recovery envelopes cannot include updates.",
					path: ["updates"],
				});
			}
			return;
		}

		let expectedSequence = envelope.fromSequence + 1;
		const worldId = envelope.updates[0]?.snapshot.worldId;
		for (const [index, update] of envelope.updates.entries()) {
			if (update.sequence !== expectedSequence) {
				context.addIssue({
					code: "custom",
					message: "Updates must be contiguous from fromSequence.",
					path: ["updates", index, "sequence"],
				});
			}
			if (worldId !== undefined && update.snapshot.worldId !== worldId) {
				context.addIssue({
					code: "custom",
					message: "Every update must describe the same world.",
					path: ["updates", index, "snapshot", "worldId"],
				});
			}
			expectedSequence = update.sequence + 1;
		}

		const expectedHead =
			envelope.updates.at(-1)?.sequence ?? envelope.fromSequence;
		if (envelope.throughSequence !== expectedHead) {
			context.addIssue({
				code: "custom",
				message: "throughSequence must match the last included update.",
				path: ["throughSequence"],
			});
		}
	});

export type PublicWorldUpdate = z.infer<typeof PublicWorldUpdateSchema>;
export type PublicWorldUpdates = z.infer<typeof PublicWorldUpdatesSchema>;
