import { Download } from "lucide-react";
import { Button } from "~/components/button/button.component";
import { EXPORT_CSV } from "~/lib/items/export-csv.config";
import { itemsToCsv } from "~/lib/items/export-csv";
import { EXPORT_ITEMS } from "./export-items.config";
import type { ExportItemsProps } from "./export-items.types";

/** Downloads the given (already filtered) items as a spreadsheet-safe CSV file. */
export function ExportItems({ items, currency }: ExportItemsProps) {
  function download() {
    const url = URL.createObjectURL(
      new Blob([itemsToCsv(items, currency)], { type: EXPORT_ITEMS.mimeType }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${EXPORT_CSV.filename}-${new Date().toISOString().slice(0, EXPORT_CSV.dateLength)}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), EXPORT_ITEMS.revokeDelayMs);
  }

  return (
    <Button small disabled={items.length === 0} onClick={download} title={EXPORT_ITEMS.description}>
      <Download size={12} />
      {EXPORT_ITEMS.label}
    </Button>
  );
}
