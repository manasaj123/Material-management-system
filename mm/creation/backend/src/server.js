import "dotenv/config";
import { config } from "./config/config.js";
import app from "./app.js";

app.listen(config.port, () => {
  console.log(`MM backend running on port ${config.port}`);
});
