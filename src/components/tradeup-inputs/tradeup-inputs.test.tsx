/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { installFakeApi, type FakeApi } from "~test/fake-api";
import { makeItem } from "~test/fixtures";
import { renderWithRouter } from "~test/router";
import { screen, setupUser } from "~test/ui";
import { TradeUpInputs } from "./tradeup-inputs.component";
import type { TradeUpInputsProps } from "./tradeup-inputs.types";

const copy = COPY.tradeup;
const CANDIDATES = [
  makeItem({ id: "a", name: "AK-47 | Redline" }),
  makeItem({ id: "b", name: "M4A4 | Howl" }),
  makeItem({ id: "c", name: "AWP | Asiimov", isStatTrak: true }),
];

function props(overrides: Partial<TradeUpInputsProps> = {}): TradeUpInputsProps {
  return {
    candidates: CANDIDATES,
    selectedIds: new Set(),
    inputCount: 2,
    currency: "USD",
    onToggle: () => {},
    onAutoFill: () => {},
    onClear: () => {},
    ...overrides,
  };
}

describe("TradeUpInputs", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
  });
  afterEach(() => api.restore());

  test("the title counts the filled slots", async () => {
    await renderWithRouter(<TradeUpInputs {...props({ selectedIds: new Set(["a"]) })} />);
    assert.ok(screen.getByRole("heading", { name: `${copy.inputs} · 1/2` }));
  });

  test("Pick cheapest and Clear fire their callbacks", async () => {
    const events: string[] = [];
    await renderWithRouter(
      <TradeUpInputs
        {...props({
          selectedIds: new Set(["a"]),
          onAutoFill: () => events.push("fill"),
          onClear: () => events.push("clear"),
        })}
      />,
    );
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: copy.autoFill }));
    await user.click(screen.getByRole("button", { name: copy.clear }));
    assert.deepEqual(events, ["fill", "clear"]);
  });

  test("with nothing to pick or clear both buttons are disabled", async () => {
    await renderWithRouter(<TradeUpInputs {...props({ candidates: [] })} />);
    assert.equal(
      (screen.getByRole("button", { name: copy.autoFill }) as HTMLButtonElement).disabled,
      true,
    );
    assert.equal(
      (screen.getByRole("button", { name: copy.clear }) as HTMLButtonElement).disabled,
      true,
    );
  });

  test("ticking a candidate toggles it", async () => {
    const toggled: string[] = [];
    await renderWithRouter(<TradeUpInputs {...props({ onToggle: (id) => toggled.push(id) })} />);
    await setupUser().click(screen.getAllByRole("checkbox")[1] as HTMLElement);
    assert.deepEqual(toggled, ["b"]);
  });

  test("a selected skin fills a slot that removes it when pressed", async () => {
    const toggled: string[] = [];
    await renderWithRouter(
      <TradeUpInputs
        {...props({ selectedIds: new Set(["a"]), onToggle: (id) => toggled.push(id) })}
      />,
    );
    await setupUser().click(screen.getByRole("button", { name: new RegExp(copy.remove) }));
    assert.deepEqual(toggled, ["a"]);
  });

  test("when every slot is full the unselected candidates are disabled", async () => {
    await renderWithRouter(<TradeUpInputs {...props({ selectedIds: new Set(["a", "b"]) })} />);
    const boxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    assert.equal(boxes[0]?.disabled, false);
    assert.equal(boxes[2]?.disabled, true);
  });

  test("StatTrak and normal skins cannot be mixed once one is picked", async () => {
    await renderWithRouter(<TradeUpInputs {...props({ selectedIds: new Set(["c"]) })} />);
    const boxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    assert.equal(boxes[0]?.disabled, true);
    assert.equal(boxes[2]?.disabled, false);
  });

  test("the search box filters the candidates", async () => {
    await renderWithRouter(<TradeUpInputs {...props()} />);
    await setupUser().type(screen.getByRole("searchbox"), "howl");
    assert.equal(screen.getAllByRole("checkbox").length, 1);
  });
});
