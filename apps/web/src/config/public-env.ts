import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url()
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function parsePublicEnv(input: Record<string, string | undefined>): PublicEnv {
  return publicEnvSchema.parse(input);
}

export function getPublicEnv(): PublicEnv {
  return parsePublicEnv({
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ??
      (process.env.NODE_ENV === "test" ? "http://localhost:4000" : undefined)
  });
}
