/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { CONNECTION_PROBLEM } from "~/components/connection-problem/connection-problem.config";
import { SNAPSHOT_CONNECTION } from "~/lib/storage/storage.config";
import { accountState, appSnapshot, FakeEventSource, installFakeApi, STEAM_ID_A, type FakeApi } from "~test/fake-api";
import { act, render, screen } from "~test/ui";
import { AuthGate } from "./auth-gate.component";

// The stream state is module-level, so these run in order: loading, failed, then connected.
describe("AuthGate", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
  });
  afterEach(() => api.restore());

  test("before the first snapshot it shows a loading skeleton, not the children", () => {
    render(
      <AuthGate>
        <p>app</p>
      </AuthGate>,
    );
    assert.ok(screen.queryByText("app") === null);
    assert.ok(screen.queryByText(COPY.signIn.title) === null);
    assert.ok(screen.getByRole("status"));
  });

  test("a failed first connection shows the problem screen", async () => {
    render(
      <AuthGate>
        <p>app</p>
      </AuthGate>,
    );
    await act(async () => FakeEventSource.instances[0]?.fail());
    const copy = CONNECTION_PROBLEM.copy[SNAPSHOT_CONNECTION.disconnected];
    assert.ok(screen.getByRole("heading", { name: copy.title }));
    assert.ok(screen.queryByText("app") === null);
  });

  test("with no accounts it shows the sign-in screen", async () => {
    render(
      <AuthGate>
        <p>app</p>
      </AuthGate>,
    );
    await api.push(appSnapshot([]));
    assert.ok(screen.getByRole("heading", { name: COPY.signIn.title }));
    assert.ok(screen.queryByText("app") === null);
  });

  test("with an account it renders the children", async () => {
    render(
      <AuthGate>
        <p>app</p>
      </AuthGate>,
    );
    await api.push(appSnapshot([accountState(STEAM_ID_A)]));
    assert.ok(screen.getByText("app"));
  });
});
