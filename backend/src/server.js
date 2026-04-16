import "dotenv/config";
import app from "./app.js";
import { runAlertCheck } from "./services/alert.service.js";
import { seedDatabase } from "./scripts/seed.js";
import { warmUpEngine } from "./services/engine.service.js";

const PORT = process.env.PORT || 3000;

setInterval(async () => {
  await runAlertCheck();
}, 300000);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Warm up engine (wakes Render free tier from sleep)
  warmUpEngine();

  // Seed zones + volunteers if DB has fewer than 15 of each
  setTimeout(async () => {
    try {
      await seedDatabase(15);
    } catch (err) {
      console.error("⚠️ Seed failed (non-fatal):", err.message);
    }
  }, 3000);
});
