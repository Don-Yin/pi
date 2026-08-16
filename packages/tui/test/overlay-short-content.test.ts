import assert from "node:assert";
import { describe, it } from "node:test";
import type { Component, TUI } from "../src/tui.ts";
import { TuiMainScreen } from "../src/tui-main-screen.ts";
import { VirtualTerminal } from "./virtual-terminal.ts";

class SimpleContent implements Component {
	private lines: string[];

	constructor(lines: string[]) {
		this.lines = lines;
	}

	setLines(lines: string[]): void {
		this.lines = lines;
	}

	render(): string[] {
		return this.lines;
	}
	invalidate() {}
}

class SimpleOverlay implements Component {
	render(): string[] {
		return ["OVERLAY_TOP", "OVERLAY_MID", "OVERLAY_BOT"];
	}
	invalidate() {}
}

class RecordingTerminal extends VirtualTerminal {
	output = "";

	override write(data: string): void {
		this.output += data;
		super.write(data);
	}
}

describe("TUI overlay with short content", () => {
	it("should render overlay when content is shorter than terminal height", async () => {
		// Terminal has 24 rows, but content only has 3 lines
		const terminal = new VirtualTerminal(80, 24);
		const tui: TUI = new TuiMainScreen(terminal);

		// Only 3 lines of content
		tui.addChild(new SimpleContent(["Line 1", "Line 2", "Line 3"]));

		// Show overlay centered - should be around row 10 in a 24-row terminal
		const overlay = new SimpleOverlay();
		tui.showOverlay(overlay);

		// Trigger render
		tui.start();
		await terminal.waitForRender();

		const viewport = terminal.getViewport();
		const hasOverlay = viewport.some((line) => line.includes("OVERLAY"));

		console.log("Terminal rows:", terminal.rows);
		console.log("Content lines: 3");
		console.log("Overlay visible:", hasOverlay);

		if (!hasOverlay) {
			console.log("\nViewport contents:");
			for (let i = 0; i < viewport.length; i++) {
				console.log(`  [${i}]: "${viewport[i]}"`);
			}
		}

		assert.ok(hasOverlay, "Overlay should be visible when content is shorter than terminal");

		tui.stop();
	});

	it("keeps overlays anchored when tall content shrinks", async () => {
		const terminal = new RecordingTerminal(40, 10);
		const tui = new TuiMainScreen(terminal);
		const content = new SimpleContent(Array.from({ length: 15 }, (_, index) => `Line ${index + 1}`));
		tui.addChild(content);
		tui.showOverlay(new SimpleOverlay(), {
			anchor: "top-right",
			width: 12,
			nonCapturing: true,
		});

		tui.start();
		await terminal.waitForRender();
		terminal.output = "";

		content.setLines(Array.from({ length: 12 }, (_, index) => `Line ${index + 1}`));
		tui.requestRender();
		await terminal.waitForRender();

		assert.ok(!terminal.output.includes("\x1b[2J"), "content shrink should not clear the viewport");
		assert.ok(!terminal.output.includes("\x1b[3J"), "content shrink should not clear scrollback");
		assert.ok(terminal.getViewport().some((line) => line.includes("OVERLAY_TOP")));

		terminal.resize(40, 12);
		content.setLines(Array.from({ length: 8 }, (_, index) => `Line ${index + 1}`));
		tui.requestRender();
		await terminal.waitForRender();
		assert.equal(
			tui.captureRenderState().previousLines.length,
			12,
			"terminal resize should reset the working-height floor",
		);

		tui.stop();
	});
});
