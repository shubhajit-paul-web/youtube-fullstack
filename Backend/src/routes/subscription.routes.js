import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import { subscribeChannel } from "../controllers/subscription.controller";
import { subscribeChannelValidator } from "../validators/subscription.validators.js";
import { validateRequest } from "../middlewares/validator.middleware.js";

const router = Router();

// POST: /api/v1/subscriptions/subscribe
router.post("/subscribe", authUser, subscribeChannelValidator, validateRequest, subscribeChannel);
