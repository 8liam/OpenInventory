export const EXPORT_CSV = {
  headers: [
    "Asset ID",
    "Item",
    "Custom name",
    "Category",
    "Rarity",
    "Wear",
    "Wear name",
    "StatTrak",
    "Souvenir",
    "Stickers",
    "Charms",
    "Pattern",
    "Location",
    "Price",
    "Currency",
  ],
  filename: "openinventory-items",
  /** Length of the YYYY-MM-DD prefix of an ISO timestamp, used in the file name. */
  dateLength: 10,
  /** Lets Excel detect UTF-8 (item names carry ™ and ★). */
  byteOrderMark: "\uFEFF",
  lineBreak: "\r\n",
  /** Joins stickers or charms inside one cell. */
  listSeparator: "; ",
  /** Prefixed to text a spreadsheet would run as a formula (CSV injection). */
  formulaEscape: "'",
} as const;
