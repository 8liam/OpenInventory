/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { RULE_FORM } from "~/components/organiser-rule-form/organiser-rule-form.config";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { installFakeApi, type FakeApi } from "~test/fake-api";
import { makeItem } from "~test/fixtures";
import { render, screen, setupUser, waitFor } from "~test/ui";
import { OrganiserPanel } from "./organiser-panel.component";
import { ORGANISER_PANEL } from "./organiser-panel.config";
import type { OrganiserPanelProps } from "./organiser-panel.types";

const UNITS = [{ id: "u1", name: "Unit A", itemCount: 0, loaded: true }];
let accountCounter = 0;

function props(overrides: Partial<OrganiserPanelProps> = {}): OrganiserPanelProps {
  accountCounter += 1;
  return {
    items: [makeItem({ id: "a", category: "Rifle" })],
    itemsReady: true,
    units: UNITS,
    accountId: `organiser-test-${accountCounter}`,
    busy: false,
    ...overrides,
  };
}

async function addRifleRule(): Promise<void> {
  const user = setupUser();
  await user.type(screen.getByLabelText(RULE_FORM.valueLabel), "Rifle");
  await user.click(screen.getByRole("combobox", { name: RULE_FORM.targetLabel }));
  await user.click(screen.getByRole("option", { name: "Unit A" }));
  await user.click(screen.getByRole("button", { name: RULE_FORM.addRule }));
}

describe("OrganiserPanel", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
  });
  afterEach(() => api.restore());

  test("with no rules it says so and Run is blocked with the reason", () => {
    render(<OrganiserPanel {...props()} />);
    assert.ok(screen.getByText(ORGANISER_PANEL.noRules));
    const run = screen.getByRole("button", { name: ORGANISER_PANEL.run });
    assert.equal(run.getAttribute("aria-disabled"), "true");
    assert.ok(screen.getByText(ORGANISER_PANEL.needsRules));
  });

  test("while items load, it says a plan cannot be previewed yet", () => {
    render(<OrganiserPanel {...props({ itemsReady: false })} />);
    assert.ok(screen.getAllByText(ORGANISER_PANEL.itemsUnavailable).length >= 1);
  });

  test("a running transfer blocks Run", () => {
    render(<OrganiserPanel {...props({ busy: true })} />);
    assert.ok(screen.getByText(ORGANISER_PANEL.busy));
  });

  test("adding a rule lists it in words and unblocks Run", async () => {
    render(<OrganiserPanel {...props()} />);
    await addRifleRule();
    assert.ok(screen.getByText("type is Rifle → Unit A"));
    assert.ok(screen.queryByText(ORGANISER_PANEL.noRules) === null);
    assert.equal(
      screen.getByRole("button", { name: ORGANISER_PANEL.run }).getAttribute("aria-disabled"),
      "false",
    );
  });

  test("a rule can be removed again", async () => {
    render(<OrganiserPanel {...props()} />);
    await addRifleRule();
    await setupUser().click(screen.getByRole("button", { name: ORGANISER_PANEL.remove }));
    assert.ok(screen.getByText(ORGANISER_PANEL.noRules));
  });

  test("Run asks for confirmation, then posts the plan's steps", async () => {
    const accountId = `organiser-run-${accountCounter + 1}`;
    render(<OrganiserPanel {...props({ accountId })} />);
    await addRifleRule();
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: ORGANISER_PANEL.run }));
    assert.equal(api.calls.length, 0);
    await user.click(
      screen.getByRole("checkbox", { name: ORGANISER_PANEL.dialog.acknowledgement }),
    );
    await user.click(screen.getByRole("button", { name: ORGANISER_PANEL.dialog.confirm }));
    await waitFor(() => assert.equal(api.calls.length, 1));
    assert.equal(api.calls[0]?.path, STORAGE_API.transferPlan);
    assert.deepEqual(api.calls[0]?.body, {
      accountId,
      steps: [{ from: "inventory", to: "u1", itemIds: ["a"] }],
    });
  });
});
