export const TRANSFER_BAR = {
  selectedLabel: (count: number) => `${count} selected`,
  clear: "Clear",
  destination: "Move to",
  choose: "Choose destination",
  move: "Move",
  confirm: (count: number, from: string, to: string) =>
    `Move ${count} ${count === 1 ? "item" : "items"} from ${from} to ${to}?`,
  confirmButton: "Confirm move",
  back: "Back",
  mixed: "Select items from one location at a time to move them.",
  tooMany: (max: number) => `You can move up to ${max} items at once.`,
  viaInventory: "Unit-to-unit moves pass through your inventory, one item at a time.",
  busy: "A transfer is running.",
  unitFull: "full",
} as const;
