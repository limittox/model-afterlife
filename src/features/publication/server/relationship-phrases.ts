import type { RelationshipDimension } from "../../world/domain/types.ts";

export type NonzeroRelationshipDelta = -1 | 1;

export function relationshipPhrase(
	dimension: RelationshipDimension,
	delta: NonzeroRelationshipDelta,
): string {
	switch (dimension) {
		case "friendship":
			return delta > 0 ? "Their friendship grew." : "Their friendship eased.";
		case "rivalry":
			return delta > 0 ? "Their rivalry sharpened." : "Their rivalry softened.";
		case "familiarity":
			return delta > 0
				? "They became more familiar with one another."
				: "Their familiarity receded.";
		default: {
			const exhaustive: never = dimension;
			return exhaustive;
		}
	}
}
