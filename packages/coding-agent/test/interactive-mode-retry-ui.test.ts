import assert from "node:assert/strict";
import test from "node:test";
import { hideSupersededRetryErrors } from "../src/modes/interactive/retry-ui.ts";

test("hides persisted retry errors once a replacement assistant exists", () => {
	const error = { role: "assistant", stopReason: "error" } as const;
	const retry = { role: "assistant", stopReason: "toolUse" } as const;
	const user = { role: "user" } as const;
	assert.deepEqual(hideSupersededRetryErrors([error, retry, user, error]), [retry, user, error]);
});
