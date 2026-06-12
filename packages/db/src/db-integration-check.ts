if (!process.env.TEST_DATABASE_URL) {
  console.error("[X] TEST_DATABASE_URL is required for DB integration tests");
  process.exit(1);
}

console.log("[OK] TEST_DATABASE_URL present");
