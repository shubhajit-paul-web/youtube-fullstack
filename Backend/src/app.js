import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

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

// Routes import
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import likeRoutes from "./routes/like.route.js";
import commentRoutes from "./routes/comment.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import tweetRoutes from "./routes/tweet.routes.js";

// Routes declaration
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/tweets", tweetRoutes);

// Error-handling middleware
app.use(errorHandler);

export default app;
