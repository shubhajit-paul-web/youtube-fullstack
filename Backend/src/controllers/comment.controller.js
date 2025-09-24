import { asyncHandler } from "../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Comment from "../models/comment.model.js";

/**
 * Get video comments
 * GET /api/v1/comments/v/:videoId?page=1&limit=10
 */
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
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
        Comment.find({ video: videoId })
            .skip(skip)
            .limit(limit)
            .populate({
                path: "owner",
                select: "username fullName avatar",
            })
            .lean(),
        Comment.find({ video: videoId }).countDocuments(),
    ]);

    const totalPages = Math.ceil(totalComments / limit);

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Video comments fetched successfully", {
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
