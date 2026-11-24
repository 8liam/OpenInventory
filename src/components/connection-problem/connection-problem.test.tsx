/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { SNAPSHOT_CONNECTION } from "~/lib/storage/storage.config";
import { installFakeApi, type FakeApi } from "~test/fake-api";
import { render, screen } from "~test/ui";
import { CONNECTION_PROBLEM } from "./connection-problem.config";
import { ConnectionProblem } from "./connection-problem.component";

describe("ConnectionProblem", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
  });
  afterEach(() => api.restore());

  test("disconnected: alert names the problem and offers Try again", () => {
    render(<ConnectionProblem reason={SNAPSHOT_CONNECTION.disconnected} />);
    const copy = CONNECTION_PROBLEM.copy[SNAPSHOT_CONNECTION.disconnected];
    assert.ok(screen.getByRole("alert"));
    assert.ok(screen.getByRole("heading", { name: copy.title }));
    assert.ok(screen.getByRole("button", { name: CONNECTION_PROBLEM.retry }));
  });

  test("incompatible: asks to reload instead", () => {
    render(<ConnectionProblem reason={SNAPSHOT_CONNECTION.incompatible} />);
    const copy = CONNECTION_PROBLEM.copy[SNAPSHOT_CONNECTION.incompatible];
    assert.ok(screen.getByRole("heading", { name: copy.title }));
    assert.ok(screen.getByRole("button", { name: CONNECTION_PROBLEM.reload }));
    assert.ok(screen.queryByRole("button", { name: CONNECTION_PROBLEM.retry }) === null);
  });
});
