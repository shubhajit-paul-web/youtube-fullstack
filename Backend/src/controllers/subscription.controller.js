import { asyncHandler } from "../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";

/**
 * (Subscribe channel)
 * POST /api/v1/subscriptions/subscribe
 * Body: { channelId }
 */
export const subscribeChannel = asyncHandler(async (req, res) => {
    const { channelId } = req.body;
    const subscriberId = req.user?._id;

    const channel = await User.findById(channelId).select("_id").lean();

    if (!channel) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Channel not found");
    }

    await Subscription.create({
        subscriber: subscriberId,
        channel: channelId,
    });

    return res
        .status(StatusCodes.CREATED)
        .json(new ApiResponse(StatusCodes.CREATED, "Channel subscribed"));
});
