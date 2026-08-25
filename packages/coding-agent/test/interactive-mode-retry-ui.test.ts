import assert from "node:assert/strict";
import test from "node:test";
import { removeTransientRetryError } from "../src/modes/interactive/retry-ui.ts";

test("removes the transient assistant error when retry starts", () => {
	const transient = {};
	const removed: unknown[] = [];
	const result = removeTransientRetryError(
		{ removeChild: (component) => removed.push(component) },
		transient,
	);
	assert.deepEqual(removed, [transient]);
	assert.equal(result, undefined);
});

test("does nothing when no transient error was rendered", () => {
	const removed: unknown[] = [];
	removeTransientRetryError(
		{ removeChild: (component) => removed.push(component) },
		undefined,
	);
	assert.deepEqual(removed, []);
});
