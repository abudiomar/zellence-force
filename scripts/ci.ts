const commands = [
  ["bun", "run", "typecheck"],
  ["bun", "run", "lint"],
  ["bun", "run", "test"],
  ["bun", "run", "build"]
] as const;

for (const command of commands) {
  const proc = Bun.spawnSync(command, {
    stdout: "inherit",
    stderr: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_API_URL:
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
    }
  });

  if (proc.exitCode !== 0) {
    console.error(`[X] CI gate failed: ${command.join(" ")}`);
    process.exit(proc.exitCode);
  }
}

console.log("[OK] CI gate passed");
