import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
} from "../controllers/subscription.controller.js";

const router = Router();

// Authenticate user
router.use(authUser);

// POST /api/v1/subscriptions/c/:channelId
router.post("/c/:channelId", toggleSubscription);

// GET /api/v1/subscriptions/c/:channelId
router.get("/c/:channelId", getUserChannelSubscribers);

// GET /api/v1/subscriptions/u/:channelId
router.get("/u/:channelId", getSubscribedChannels);

export default router;
