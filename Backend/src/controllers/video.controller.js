import { asyncHandler } from "../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import { PaginationResponse } from "../utils/PaginationResponse.js";

/**
 * Get all videos
 * GET /api/v1/videos?page=1&limit=10&query=node&sortBy=createdAt&sortType=asc&channelId=abc123
 */
export const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = "asc",
        channelId,
    } = req.query;

    if (!channelId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Channel ID is required");
    }

    const hasChannel = await User.findById(channelId).select("username").lean();

    if (!hasChannel) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Channel not found");
    }

    const skip = (page - 1) * limit;

    const [videos, totalVideos] = await Promise.all([
        Video.find({
            owner: channelId,
            title: {
                $regex: query || "",
                $options: "i",
            },
            isPublished: true,
        })
            .select("_id videoFile thumbnail title duration views createdAt")
            .sort({ [sortBy]: sortType === "asc" ? 1 : -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Video.countDocuments({ owner: channelId, isPublished: true }),
    ]);

    return res
        .status(StatusCodes.OK)
        .json(
            new ApiResponse(
                StatusCodes.OK,
                "Videos fetched successfully",
                new PaginationResponse(totalVideos, videos, page, limit)
            )
        );
});
