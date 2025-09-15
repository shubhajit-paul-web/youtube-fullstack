import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// build-in middlewares
app.use(
    express.json({
        limit: "20kb",
    })
);
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

// Routes
import authRoutes from "./routes/auth.routes.js";

app.use("/api/v1/auth", authRoutes);

export default app;
