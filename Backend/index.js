import dotenv from "dotenv";
import connectDB from "./src/db/db.js";
import app from "./src/app.js";

dotenv.config({
    path: "./env",
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error(`Uncaught Exception: ${error.stack}`);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    console.log(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    process.exit(1);
});

// Connect to DB and start the server
(async () => {
    try {
        const PORT = process.env.PORT || 3000;

        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`Server is listening on PORT: ${PORT}`);
        });

        // Handle graceful shutdown on SIGINT
        process.on("SIGINT", async () => {
            console.log("Shutting down gracefully...");
            server.close(() => process.exit(0));
        });
    } catch (error) {
        console.error(`Failed to start the server: ${error.message}`);
        process.exit(1);
    }
})();
