import { asyncHandler } from "../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import Playlist from "../models/playlist.model.js";
import Video from "../models/video.model.js";

/**
 * Create playlist
 * POST /api/v1/playlists
 * Body: { name, description }
 */
export const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const createdPlaylist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    });

    return res
        .status(StatusCodes.CREATED)
        .json(
            new ApiResponse(StatusCodes.CREATED, "Playlist created successfully", createdPlaylist)
        );
});

/**
 * Get user playlists
 * GET /api/v1/playlists/user/:userId
 */
export const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    validateObjectId(userId);

    const playlists = await Playlist.find({ owner: userId });

    return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "User Playlists fetched successfully", playlists));
});

/**
 * Get playlist by ID
 * GET /api/v1/playlists/:id
 */
export const getPlaylistById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    validateObjectId(id);

    const playlist = await Playlist.findById(id)
        .populate({ path: "owner", select: "username fullName avatar" })
        .lean();

    if (!playlist) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Playlist not found");
    }

    return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "Playlist fetched successfully", playlist));
});

/**
 * Add video to playlist
 * PATCH /api/v1/playlists/:playlistId/:videoId
 */
export const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    validateObjectId(playlistId, "Playlist");
    validateObjectId(videoId, "Video");

    const [videoExists, videoInPlaylist] = await Promise.all([
        Video.exists({ _id: videoId, isPublished: true }).lean(),
        Playlist.exists({ _id: playlistId, videos: videoId }).lean(),
    ]);

    if (!videoExists) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Video not found or not published");
    }
    if (videoInPlaylist) {
        throw new ApiError(StatusCodes.CONFLICT, "This video already exists in the playlist");
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id,
        },
        {
            $addToSet: {
                videos: videoId,
            },
        },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Playlist not found or you don't have permission to update it"
        );
    }

    return res
        .status(StatusCodes.OK)
        .json(
            new ApiResponse(
                StatusCodes.OK,
                "Video has been added to the playlist successfully",
                updatedPlaylist
            )
        );
});

/**
 * Remove video from playlist
 * DELETE /api/v1/playlists/:playlistId/:videoId
 */
export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    validateObjectId(playlistId, "Playlist");
    validateObjectId(videoId, "Video");

    const videoInPlaylist = await Playlist.exists({
        _id: playlistId,
        videos: videoId,
    }).lean();

    if (!videoInPlaylist) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Video not found in the playlist");
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id,
        },
        {
            $pull: {
                videos: videoId,
            },
        },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Playlist not found or you don't have permission to update it"
        );
    }

    return res
        .status(StatusCodes.OK)
        .json(
            new ApiResponse(
                StatusCodes.OK,
                "Video removed from playlist successfully",
                updatedPlaylist
            )
        );
});

/**
 * Update playlist
 * PATCH /api/v1/playlists/:playlistId
 * Body: { name, description }
 */
export const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    validateObjectId(playlistId, "Playlist");

    if (!name && !description) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Please provide at least one field: name or description"
        );
    }

    const playlist = await Playlist.findOne({
        _id: playlistId,
        owner: req.user?._id,
    });

    if (!playlist) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Playlist not found or you don't have permission to update it"
        );
    }

    if (name) playlist.name = name;
    if (description) playlist.description = description;

    const updatedPlaylist = await playlist.save();

    return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "Playlist updated successfully", updatedPlaylist));
});

/**
 * Delete playlist
 * DELETE /api/v1/playlists/:playlistId
 */
export const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    validateObjectId(playlistId, "Playlist");

    const isPlaylistDeleted = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user?._id,
    }).lean();

    if (!isPlaylistDeleted) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Playlist not found or you don't have permission to delete it"
        );
    }

    return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "Playlist deleted successfully"));
});
