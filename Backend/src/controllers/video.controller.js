import { asyncHandler } from "../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import { PaginationResponse } from "../utils/PaginationResponse.js";
import { uploadFile } from "../services/storage.service.js";
import { checkFileType } from "../utils/checkFileType.js";

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

/**
 * Get video by ID
 * GET /api/v1/videos/:id
 */
export const getVideoById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const video = await Video.findOne({
        _id: id,
        isPublished: true,
    })
        .select("-__v -updatedAt")
        .populate({
            path: "owner",
            select: "_id username fullName avatar",
        })
        .lean();

    if (!video) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Video not found");
    }

    return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "Video fetched successfully", video));
});

/**
 * Publish/upload a video
 * POST /api/v1/videos
 */
export const publishAVideo = asyncHandler(async (req, res) => {
    const { videoFile, thumbnail } = req.files;
    const { title, description } = req.body;
    const user = req.user;

    checkFileType(videoFile?.[0], "video", "Video file is required");
    checkFileType(thumbnail?.[0], "image", "Thumbnail image is required");

    // Upload video and thumbnail
    const [uploadedVideo, uploadedThumbnail] = await Promise.all([
        uploadFile(videoFile[0], "videos"),
        uploadFile(thumbnail[0], "thumbnails"),
    ]);

    if (!uploadedVideo?.url) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to upload video. Please try again");
    }
    if (!uploadedThumbnail?.url) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Failed to upload thumbnail image. Please try again"
        );
    }

    const publishedVideo = (
        await Video.create({
            videoFile: uploadedVideo.url,
            thumbnail: uploadedThumbnail.url,
            owner: user._id,
            title,
            description,
            duration: uploadedVideo.duration,
        })
    ).toJSON();

    publishedVideo.owner = {
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
    };

    return res
        .status(StatusCodes.CREATED)
        .json(new ApiResponse(StatusCodes.CREATED, "Video published successfully", publishedVideo));
});
