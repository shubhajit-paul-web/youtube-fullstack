import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import {
    getAllVideos,
    getVideoById,
    publishAVideo,
    updateVideo,
} from "../controllers/video.controller.js";
import { publishAVideoValidator, updateVideoValidator } from "../validators/video.validators.js";
import { validateRequest } from "../middlewares/validator.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

// Authenticate user
router.use(authUser);

// GET /api/v1/videos?page=1&limit=10&query=node&sortBy=createdAt&sortType=asc&channelId=abc123
router.get("/", getAllVideos);

// GET /api/v1/videos/:id
router.get("/:id", getVideoById);

// POST /api/v1/videos
router.post(
    "/",
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    publishAVideoValidator,
    validateRequest,
    publishAVideo
);

// PATCH /api/v1/videos/:id
router.patch(
    "/:id",
    upload.single("thumbnail"),
    updateVideoValidator,
    validateRequest,
    updateVideo
);

export default router;
