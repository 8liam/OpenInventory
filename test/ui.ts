import { cleanup, render, screen, within, fireEvent, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach } from "node:test";

afterEach(() => cleanup());

/** A user-event session bound to the shared document. Call once per test: it carries pointer state. */
export function setupUser(): ReturnType<typeof userEvent.setup> {
  return userEvent.setup({ document });
}

export { act, fireEvent, render, screen, waitFor, within };
