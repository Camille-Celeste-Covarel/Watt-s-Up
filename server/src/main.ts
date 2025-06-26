import dotenv from "dotenv";
dotenv.config();

// Import
import app from "./app";
import { cleanOldLogs } from "./tools/logger";

// Get the port from the environment variables
const port = process.env.PORT;

cleanOldLogs();

// Start the server and listen on the specified port
app
  .listen(port, () => {
    console.info(`Server is listening on port ${port}`);
  })
  .on("error", (err: Error) => {
    console.error("Error:", err.message);
  });
