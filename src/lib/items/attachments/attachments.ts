import { ATTACHMENTS_FILE } from "../../../../data/index.generated.ts";
import { describeIssues } from "../patterns/pattern-file.utils.ts";
import { attachmentsFileSchema, type AttachmentsFile } from "./attachments-file.schema.ts";

export function loadAttachments(raw: unknown = ATTACHMENTS_FILE): AttachmentsFile["entries"] {
  const parsed = attachmentsFileSchema.safeParse(raw);
  if (!parsed.success) throw new Error(`Invalid attachments data: ${describeIssues(parsed.error)}`);
  return parsed.data.entries;
}

export const NOTABLE_ATTACHMENTS = loadAttachments();
