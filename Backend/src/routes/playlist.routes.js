import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import {
    createPlaylistValidator,
    updatePlaylistValidator,
} from "../validators/playlist.validator.js";
import { validateRequest } from "../middlewares/validator.middleware.js";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

// Authenticate user
router.use(authUser);

// POST /api/v1/playlists
router.post("/", createPlaylistValidator, validateRequest, createPlaylist);

// GET /api/v1/playlists/user/:userId
router.get("/user/:userId", getUserPlaylists);

// GET /api/v1/playlists/:id
router.get("/:id", getPlaylistById);

// PATCH /api/v1/playlists/:playlistId/:videoId
router.patch("/:playlistId/:videoId", addVideoToPlaylist);

// DELETE /api/v1/playlists/:playlistId/:videoId
router.delete("/:playlistId/:videoId", removeVideoFromPlaylist);

// PATCH /api/v1/playlists/:playlistId
router.patch("/:playlistId", updatePlaylistValidator, validateRequest, updatePlaylist);

// DELETE /api/v1/playlists/:playlistId
router.delete("/:playlistId", deletePlaylist);

export default router;
