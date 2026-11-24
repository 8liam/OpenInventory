/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { render, screen, setupUser } from "~test/ui";
import { HighlightPlayer } from "./highlight-player.component";

describe("HighlightPlayer", () => {
  test("offers a labelled Play button and no video until opened", () => {
    const { container } = render(<HighlightPlayer videoUrl="v.webm" title="Charm" />);
    assert.ok(screen.getByRole("button", { name: `${COPY.highlight.play}: Charm` }));
    assert.equal(container.querySelectorAll("video").length, 0);
  });

  test("Play mounts the video with the given source in a dialog", async () => {
    const { container } = render(<HighlightPlayer videoUrl="v.webm" title="Charm" />);
    await setupUser().click(screen.getByRole("button", { name: `${COPY.highlight.play}: Charm` }));
    const video = container.querySelector("video");
    assert.equal(video?.getAttribute("src"), "v.webm");
    assert.equal(video?.getAttribute("title"), "Charm");
    assert.ok(screen.getByRole("dialog"));
  });
});
