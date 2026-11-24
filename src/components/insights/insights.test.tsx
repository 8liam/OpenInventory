/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { formatFloat } from "~/utils/format";
import { makeHolding } from "~test/fixtures";
import { renderWithRouter } from "~test/router";
import { screen } from "~test/ui";
import { Insights } from "./insights.component";

const FLOAT = { id: "a1", name: "AK-47 | Redline", wear: 0.0123, imageUrl: null, rarityColor: null, price: null };

describe("Insights", () => {
  test("empty lists say so under each heading", async () => {
    await renderWithRouter(<Insights currency="USD" insights={{ lowestFloats: [], highestFloats: [], stacks: [] }} />);
    for (const title of [COPY.insights.lowestFloats, COPY.insights.highestFloats, COPY.insights.stacks]) {
      assert.ok(screen.getByRole("heading", { name: title }));
    }
    assert.equal(screen.getAllByText(COPY.insights.empty).length, 3);
  });

  test("float rows show the wear and link to the item in Items", async () => {
    await renderWithRouter(
      <Insights currency="USD" insights={{ lowestFloats: [FLOAT], highestFloats: [], stacks: [] }} />,
    );
    assert.ok(screen.getByText(formatFloat(FLOAT.wear)));
    const link = screen.getByRole("link");
    assert.ok(link.getAttribute("href")?.startsWith("/items"));
    assert.ok(link.getAttribute("href")?.includes("a1"));
  });

  test("stack rows show the count and total value", async () => {
    await renderWithRouter(
      <Insights
        currency="USD"
        insights={{ lowestFloats: [], highestFloats: [], stacks: [makeHolding({ name: "Case", count: 4, totalValue: 6 })] }}
      />,
    );
    assert.ok(screen.getByText(/×4/));
    assert.ok(screen.getByText(/\$6\.00/));
  });
});
