import { z } from "zod";

export const HomeClockSchema = z
	.object({
		logicalTick: z.number().int().nonnegative(),
		homeDay: z.number().int().positive(),
		homeTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/u),
		dayPeriod: z.enum(["morning", "afternoon", "evening", "night"]),
	})
	.strict();

export type HomeClock = z.infer<typeof HomeClockSchema>;

export function homeClockForLogicalTick(logicalTick: number): HomeClock {
	if (!Number.isSafeInteger(logicalTick) || logicalTick < 0) {
		throw new RangeError("Logical tick must be a nonnegative safe integer.");
	}

	const minutesInDay = 24 * 60;
	const minutesFromEpoch = 9 * 60 + logicalTick;
	const totalMinutes = minutesFromEpoch % minutesInDay;
	const hour = Math.floor(totalMinutes / 60);
	const minute = totalMinutes % 60;
	const dayPeriod =
		hour < 12
			? "morning"
			: hour < 17
				? "afternoon"
				: hour < 21
					? "evening"
					: "night";

	return HomeClockSchema.parse({
		logicalTick,
		homeDay: Math.floor(minutesFromEpoch / minutesInDay) + 1,
		homeTime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
		dayPeriod,
	});
}
