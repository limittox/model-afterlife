import { createHash } from "node:crypto";

function canonicalize(value: unknown): string {
	if (value === null) {
		return "null";
	}
	if (typeof value === "string" || typeof value === "boolean") {
		return JSON.stringify(value);
	}
	if (typeof value === "number") {
		if (!Number.isSafeInteger(value)) {
			throw new TypeError("Canonical world numbers must be safe integers.");
		}
		return String(value);
	}
	if (Array.isArray(value)) {
		return `[${value.map(canonicalize).join(",")}]`;
	}
	if (typeof value === "object") {
		if (Object.getPrototypeOf(value) !== Object.prototype) {
			throw new TypeError("Canonical world objects must be plain objects.");
		}
		const record = value as Record<string, unknown>;
		const entries = Object.keys(record)
			.sort()
			.map((key) => {
				if (record[key] === undefined) {
					throw new TypeError(
						"Canonical world objects cannot contain undefined.",
					);
				}
				return `${JSON.stringify(key)}:${canonicalize(record[key])}`;
			});
		return `{${entries.join(",")}}`;
	}

	throw new TypeError(`Unsupported canonical value: ${typeof value}.`);
}

export function canonicalSerialize(value: unknown): string {
	return canonicalize(value);
}

export function canonicalStateHash(value: unknown): string {
	return createHash("sha256").update(canonicalSerialize(value)).digest("hex");
}
