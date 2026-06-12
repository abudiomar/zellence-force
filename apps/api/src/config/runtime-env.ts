import { parseEnv, type RuntimeEnvInput } from "@zellforce/config";

export function loadApiEnv(input: RuntimeEnvInput) {
  const result = parseEnv(input);

  if (!result.ok) {
    throw new Error(`Missing required env vars: ${result.issues.join(", ")}`);
  }

  return result.env;
}
