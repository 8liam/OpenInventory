import { z } from "zod";
import { PATTERN_FILE } from "../patterns/pattern-file.config.ts";
import { ATTACHMENT_KINDS } from "./attachments-file.config.ts";

/** Stickers and charms that make a craft or an item notable. Edited in `data/attachments.json`. */
export const attachmentsFileSchema = z.object({
  $schema: z.string().optional(),
  retrieved: z.string().regex(PATTERN_FILE.retrievedPattern),
  notes: z.array(z.string().min(1)).default([]),
  entries: z.array(
    z.object({
      /** An attachment matches when its name contains this, ignoring case. */
      name: z.string().min(1),
      kind: z.enum(ATTACHMENT_KINDS),
      note: z.string().min(1).optional(),
    }),
  ),
});

export type AttachmentsFile = z.infer<typeof attachmentsFileSchema>;
