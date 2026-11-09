const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const readline = require("readline");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  try {
    for (const email of [
      "admin@smartinventory.local",
      "staff@smartinventory.local",
    ]) {
      const password = await ask(`Enter a new password for ${email}: `);

      if (password.length < 12) {
        throw new Error("Password must be at least 12 characters.");
      }

      const hash = await bcrypt.hash(password, 12);

      await pool.query(
        "UPDATE users SET password_hash = $1 WHERE email = $2",
        [hash, email]
      );

      console.log(`Password securely updated for ${email}`);
    }
  } finally {
    rl.close();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Password setup failed:", error.message);
  process.exitCode = 1;
});
