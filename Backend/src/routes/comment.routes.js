import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import {
    getComments,
    createComment,
    updateComment,
    deleteComment,
} from "../controllers/comment.controller";

const router = Router();

// Authenticate user
router.use(authUser);

// GET /api/v1/comments/:targetType/:targetId?page=1&limit=10
router.get("/:targetType/:targetId", getComments);

// POST /api/v1/comments/:targetType/:targetId
router.post("/:targetType/:targetId", createComment);

// PATCH /api/v1/comments/:commentId
router.patch("/:commentId", updateComment);

// DELETE /api/v1/comments/:commentId
router.delete("/:commentId", deleteComment);

export default router;
