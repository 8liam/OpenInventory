import { SNAPSHOT_CONNECTION } from "~/lib/storage/storage.config";

export const CONNECTION_PROBLEM = {
  copy: {
    [SNAPSHOT_CONNECTION.disconnected]: {
      title: "Can't reach the OpenInventory server",
      body: "The page couldn't open its live connection. Check that the server is running, then try again.",
    },
    [SNAPSHOT_CONNECTION.incompatible]: {
      title: "This page doesn't match the server",
      body: "The server sent data this version of the page can't read. Reload to get the matching version.",
    },
  },
  retry: "Try again",
  reload: "Reload page",
  iconSize: 14,
} as const;
