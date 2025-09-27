import { asyncHandler } from "../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import { PaginationResponse } from "../utils/PaginationResponse.js";
import { deleteFile, uploadFile } from "../services/storage.service.js";
import { checkFileType } from "../utils/checkFileType.js";
import { validateObjectId } from "../utils/validateObjectId.js";

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

    validateObjectId(channelId, "Channel");

    const hasChannel = await User.findById(channelId).select("username").lean();

    if (!hasChannel) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Channel not found");
    }

    const skip = (page - 1) * limit;

    // filter
    const videoQuery = {
        owner: channelId,
        isPublished: true,
    };

    if (query) {
        videoQuery.title = { $regex: query, $options: "i" };
    }

    const [videos, totalVideos] = await Promise.all([
        Video.find(videoQuery)
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

    const video = await Video.findOneAndUpdate(
        {
            _id: id,
            isPublished: true,
        },
        {
            $inc: { views: 1 },
        },
        {
            new: true,
            runValidators: false,
        }
    )
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

/**
 * Update a video
 * PATCH /api/v1/videos/:id
 */
export const updateVideo = asyncHandler(async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    const { title, description } = req.body || {};
    const thumbnail = req.file;

    if (!title && !description && !thumbnail) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Please provide something to update — a title, description, or thumbnail"
        );
    }

    const video = await Video.findOne({
        _id: id,
        owner: user._id,
    });

    if (!video) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Video not found or you don't have access to it");
    }

    // Update video details (title, description, thumbnail)
    if (title) video.title = title;
    if (description) video.description = description;
    if (thumbnail) {
        checkFileType(thumbnail, "image", "Please upload a valid image for the thumbnail");

        const uploadedThumbnail = await uploadFile(thumbnail, "thumbnails");

        if (!uploadedThumbnail?.url) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Failed to upload thumbnail image. Please try again"
            );
        }

        // Delete the old thumbnail image from ImageKit
        deleteFile(video.thumbnail, "thumbnails");

        video.thumbnail = uploadedThumbnail.url;
    }

    const updatedVideo = (await video.save()).toJSON();

    updatedVideo.owner = {
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
    };

    return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "Video updated successfully", updatedVideo));
});

/**
 * Delete a video
 * DELETE /api/v1/videos/:id
 */
export const deleteVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    validateObjectId(id, "Video");

    const isVideoDeleted = await Video.findOneAndDelete({
        _id: id,
        owner: req.user?._id,
    }).lean();

    if (!isVideoDeleted) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Video not found or you don't have access to it");
    }

    return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "Video deleted successfully"));
});

/**
 * Toggle public status
 * PATCH /api/v1/videos/:id/status
 */
export const togglePublicStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    validateObjectId(id, "Video");

    const video = await Video.findOne({
        _id: id,
        owner: req.user?._id,
    }).select("-owner -__v");

    if (!video) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Video not found or you don't have access to it");
    }

    video.isPublished = !video.isPublished;
    const updatedVideo = await video.save({ validateBeforeSave: false });

    return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "Video status changed successfully", updatedVideo));
});
