import { createFileRoute } from "@tanstack/react-router";
import { SharedInventory } from "~/components/shared-inventory/shared-inventory.component";
import { useSharedInventory } from "~/lib/shares/share.hooks";

export const Route = createFileRoute("/share/$token")({
  component: SharedInventoryRoute,
});

/** A public share page: no sign-in, no app shell, read-only. */
function SharedInventoryRoute() {
  const { token } = Route.useParams();
  const state = useSharedInventory(token);
  return (
    <main className="min-h-dvh bg-background p-4 text-foreground md:p-6">
      <SharedInventory state={state} />
    </main>
  );
}
