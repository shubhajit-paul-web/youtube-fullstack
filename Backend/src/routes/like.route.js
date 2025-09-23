import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
} from "../controllers/like.controller.js";

const router = Router();

// Authenticate user
router.use(authUser);

// POST /api/v1/likes/toggle/v/:videoId
router.post("/toggle/v/:videoId", toggleVideoLike);

// POST /api/v1/likes/toggle/c/:commentId
router.post("/toggle/c/:commentId", toggleCommentLike);

// POST /api/v1/likes/toggle/t/:tweetId
router.post("/toggle/t/:tweetId", toggleTweetLike);

// GET /api/v1/likes/videos
router.get("/videos", getLikedVideos);
