import { asyncHandler } from "../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Comment from "../models/comment.model.js";
import { PaginationResponse } from "../utils/PaginationResponse.js";
import Video from "../models/video.model.js";
import Tweet from "../models/tweet.model.js";

/**
 * Get comments for a video/tweet
 * GET /api/v1/comments/:targetType/:targetId?page=1&limit=10
 * targetType: ["video", "tweet"]
 */
export const getComments = asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // Checks video/tweet is exists or not
    if (targetType === "video") {
        const isVideoExists = await Video.exists({ _id: targetId });

        if (!isVideoExists) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Video not found");
        }
    } else {
        const isTweetExists = await Tweet.exists({ _id: targetId });

        if (!isTweetExists) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Tweet not found");
        }
    }

    const [comments, totalComments] = await Promise.all([
        Comment.find({ [targetType]: targetId })
            .select("content owner createdAt updatedAt")
            .skip(skip)
            .limit(limit)
            .populate({
                path: "owner",
                select: "username fullName avatar",
            })
            .lean(),
        Comment.countDocuments({ [targetType]: targetId }),
    ]);

    return res
        .status(StatusCodes.OK)
        .json(
            new ApiResponse(
                StatusCodes.OK,
                "Comments fetched successfully",
                new PaginationResponse(totalComments, comments, page, limit)
            )
        );
});

/**
 * Add a comment to a video/tweet
 * POST /api/v1/comments/:targetType/:targetId
 * targetType: ["video", "tweet"]
 * Body: { content }
 */
export const createComment = asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.params;
    const content = req.body.content;

    const createdComment = await Comment.create({
        [targetType]: targetId,
        content,
        owner: req.user?._id,
    });

    return res.status(StatusCodes.CREATED).json(
        new ApiResponse(StatusCodes.CREATED, "Comment created successfully", {
            content: createdComment.content,
            owner: {
                username: req.user?.username,
                fullName: req.user?.fullName,
                avatar: req.user?.avatar,
            },
        })
    );
});

/**
 * Update a comment to a video/tweet
 * PATCH /api/v1/comments/:commentId
 * Body: { content }
 */
export const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const content = req.body.content;

    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user?._id,
        },
        {
            $set: { content },
        },
        {
            new: true,
            runValidators: true,
        }
    ).lean();

    if (!updatedComment) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found or not owned by user");
    }

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Comment updated successfully", {
            content: updatedComment.content,
            owner: {
                username: req.user?.username,
                fullName: req.user?.fullName,
                avatar: req.user?.avatar,
            },
        })
    );
});

/**
 * Delete a comment to a video/tweet
 * DELETE /api/v1/comments/:commentId
 */
export const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user?._id,
    }).lean();

    if (!deletedComment) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found");
    }

    return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "Comment deleted successfully"));
});
