import { asyncHandler } from "../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";

/**
 * (Subscribe channel)
 * POST /api/v1/subscriptions/c/:channelId
 */
export const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const channel = await User.findById(channelId).select("_id").lean();

    if (!channel) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Channel not found");
    }

    const isAlreadySubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    });

    if (isAlreadySubscribed) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You are already subscribed to this channel");
    }

    await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId,
    });

    return res
        .status(StatusCodes.CREATED)
        .json(new ApiResponse(StatusCodes.CREATED, "Channel subscribed successfully"));
});

/**
 * (Get subscribers list of a channel)
 * GET /api/v1/subscriptions/c/:channelId
 */
export const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const hasChannel = await User.findById(channelId).select("username").lean();

    if (!hasChannel) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Channel does not exists");
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .select("subscriber")
        .populate({
            path: "subscriber",
            select: "username avatar",
        })
        .lean();

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Subscribers fetched successfully", {
            totalSubscribers: subscribers.length,
            subscribers,
        })
    );
});

/**
 * (Get subscribed channels)
 * GET /api/v1/subscriptions/u/:channelId
 */
export const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const hasChannel = await User.findById(channelId).select("username").lean();

    if (!hasChannel) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Channel does not exists");
    }

    const subscribedChannels = await Subscription.find({ subscriber: channelId })
        .select("channel")
        .populate({
            path: "channel",
            select: "username fullName avatar",
        })
        .lean();

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Subscribed channels fetched successfully", {
            totalSubscribedChannels: subscribedChannels.length,
            subscribedChannels,
        })
    );
});
