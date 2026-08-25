import type { Component, Container } from "@earendil-works/pi-tui";

export function removeTransientRetryError(
	container: Pick<Container, "removeChild">,
	component: Component | undefined,
): undefined {
	if (component) container.removeChild(component);
	return undefined;
}
