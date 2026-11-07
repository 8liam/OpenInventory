import { Download } from "lucide-react";
import { Button } from "~/components/button/button.component";
import { EXPORT_CSV } from "~/lib/items/export-csv.config";
import { itemsToCsv, itemsToJson } from "~/lib/items/export-csv";
import { EXPORT_ITEMS } from "./export-items.config";
import type { ExportItemsProps } from "./export-items.types";

/** Downloads the given (already filtered) items as a spreadsheet-safe CSV file. */
export function ExportItems({ items, currency }: ExportItemsProps) {
  function download(format: "csv" | "json") {
    const isCsv = format === "csv";
    const url = URL.createObjectURL(
      new Blob([isCsv ? itemsToCsv(items, currency) : itemsToJson(items, currency)], {
        type: isCsv ? EXPORT_ITEMS.mimeType : "application/json;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${EXPORT_CSV.filename}-${new Date().toISOString().slice(0, EXPORT_CSV.dateLength)}.${format}`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), EXPORT_ITEMS.revokeDelayMs);
  }

  return (
    <>
      <Button
        small
        disabled={items.length === 0}
        onClick={() => download("csv")}
        title={EXPORT_ITEMS.description}
      >
        <Download size={12} />
        {EXPORT_ITEMS.label}
      </Button>
      <Button
        small
        disabled={items.length === 0}
        onClick={() => download("json")}
        title={EXPORT_ITEMS.description}
      >
        <Download size={12} /> Export JSON
      </Button>
    </>
  );
}
