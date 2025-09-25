import { asyncHandler } from "../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Tweet from "../models/tweet.model.js";
import { validateObjectId } from "../utils/validateObjectId.js";

/**
 * Get users tweets
 * GET /api/v1/tweets/:channelId
 */
export const getUserTweets = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    validateObjectId(channelId, "Channel ID");

    const tweets = await Tweet.find({ owner: channelId })
        .select("content createdAt updatedAt")
        .lean();

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Tweets fetched successfully", {
            totalTweets: tweets.length,
            tweets,
        })
    );
});

/**
 * Create tweet
 * POST /api/v1/tweets
 * Body: { content }
 */
export const createTweet = asyncHandler(async (req, res) => {
    const content = req.body?.content?.trim();
    const user = req.user;

    if (!content) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Tweet content cannot be empty");
    }

    const createdTweet = await Tweet.create({
        content,
        owner: user._id,
    });

    return res.status(StatusCodes.CREATED).json(
        new ApiResponse(StatusCodes.CREATED, "Tweet created successfully", {
            content: createdTweet.content,
            owner: {
                username: user.username,
                fullName: user.fullName,
                avatar: user.avatar,
            },
            createdAt: createdTweet.createdAt,
        })
    );
});

/**
 * Update tweet
 * PATCH /api/v1/tweets/:tweetId
 * Body: { content }
 */
export const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const content = req.body?.content?.trim();
    const user = req.user;

    validateObjectId(tweetId, "Tweet ID");

    if (!content) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Tweet content cannot be empty");
    }

    const updatedTweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner: user._id,
        },
        {
            $set: {
                content,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!updatedTweet) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Tweet not found or not authorized to update");
    }

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Tweet updated successfully", {
            content: updatedTweet.content,
            owner: {
                username: user.username,
                fullName: user.fullName,
                avatar: user.avatar,
            },
            updatedAt: updatedTweet.updatedAt,
        })
    );
});

/**
 * Delete tweet
 * DELETE /api/v1/tweets/:tweetId
 */

export const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    validateObjectId(tweetId, "Tweet ID");

    const deletedTweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: req.user?._id,
    }).lean();

    if (!deletedTweet) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Tweet not found or not authorized to update");
    }

    return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "Tweet deleted successfully"));
});
