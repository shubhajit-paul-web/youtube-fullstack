import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import {
    getUserTweets,
    createTweet,
    updateTweet,
    deleteTweet,
} from "../controllers/tweet.controller.js";

const router = Router();

// Authenticate user
router.use(authUser);

// GET /api/v1/tweets/:channelId
router.get("/:channelId", getUserTweets);

// POST /api/v1/tweets
router.post("/", createTweet);

// PATCH /api/v1/tweets/:tweetId
router.patch("/:tweetId", updateTweet);

// DELETE /api/v1/tweets/:tweetId
router.delete("/:tweetId", deleteTweet);

export default router;
