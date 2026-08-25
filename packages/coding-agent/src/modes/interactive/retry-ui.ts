function isAssistant(item: unknown): item is { role: "assistant"; stopReason?: string } {
	return typeof item === "object" && item !== null && "role" in item && item.role === "assistant";
}

export function hideSupersededRetryErrors<T>(items: readonly T[]): T[] {
	return items.filter(
		(item, index) => !(isAssistant(item) && item.stopReason === "error" && isAssistant(items[index + 1])),
	);
}
