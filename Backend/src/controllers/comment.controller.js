import { asyncHandler } from "../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Comment from "../models/comment.model.js";

/**
 * Get comments for a video/tweet
 * GET /api/v1/comments/:targetType/:targetId?page=1&limit=10
 * targetType: ["video", "tweet"]
 */
export const getComments = asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.params;

    if (!["video", "tweet"].includes(targetType)) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Bad request: targetType must be either 'video' or 'tweet'"
        );
    }

    const page = parseInt(req.query?.page) || 1;
    const limit = parseInt(req.query?.limit) || 10;

    const skip = (page - 1) * limit;

    if (page < 1) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Page number must be greater than 0");
    }

    if (limit > 50) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Maximum allowed limit is 50 items per request"
        );
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
        Comment.find({ [targetType]: targetId }).countDocuments(),
    ]);

    const totalPages = Math.ceil(totalComments / limit);

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Comments fetched successfully", {
            pagination: {
                currentPage: page,
                limit: limit,
                totalPages,
                totalComments,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                nextPage: page < totalPages ? ++page : null,
                prevPage: page > 1 ? --page : null,
            },
            comments,
        })
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

    if (!["video", "tweet"].includes(targetType)) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Bad request: targetType must be either 'video' or 'tweet'"
        );
    }

    const content = req.body?.content;

    if (!content?.trim()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Comment content cannot be empty");
    }

    const createdComment = await Comment.create({
        [targetType]: targetId,
        content: String(content)?.trim(),
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
    const content = req.body?.content;

    if (!content?.trim()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Comment content cannot be empty");
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user?._id,
        },
        {
            $set: {
                content: String(content)?.trim(),
            },
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
