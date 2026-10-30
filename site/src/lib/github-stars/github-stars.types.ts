import { z } from "zod";

export const repoResponseSchema = z.object({ stargazers_count: z.number().int().nonnegative() });

export type RepoResponse = z.infer<typeof repoResponseSchema>;
