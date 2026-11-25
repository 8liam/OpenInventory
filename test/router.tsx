import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { act, render } from "@testing-library/react";
import type { ReactNode } from "react";

const ROUTE_PATHS = [
  "/",
  "/items",
  "/storage",
  "/terminals",
  "/tradeup",
  "/cases",
  "/settings",
] as const;

/** Mounts `ui` as the root route's content inside a memory router, so `Link` and route hooks work. */
export async function renderWithRouter(ui: ReactNode, path: string = "/") {
  const root = createRootRoute({
    component: () => (
      <>
        {ui}
        <Outlet />
      </>
    ),
  });
  const children = ROUTE_PATHS.map((to) =>
    createRoute({ getParentRoute: () => root, path: to, component: () => null }),
  );
  const router = createRouter({
    routeTree: root.addChildren(children),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  let result: ReturnType<typeof render> | undefined;
  await act(async () => {
    result = render(<RouterProvider router={router} />);
  });
  if (!result) throw new Error("render did not run");
  return { ...result, router };
}
