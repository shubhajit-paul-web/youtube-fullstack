import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import { paginationValidator } from "../validators/pagination.validators.js";
import {
    createCommentValidator,
    updateCommentValidator,
} from "../validators/comment.validators.js";
import { validateRequest } from "../middlewares/validator.middleware.js";
import {
    getComments,
    createComment,
    updateComment,
    deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();

// Authenticate user
router.use(authUser);

// GET /api/v1/comments/:targetType/:targetId?page=1&limit=10
router.get("/:targetType/:targetId", paginationValidator, validateRequest, getComments);

// POST /api/v1/comments/:targetType/:targetId
router.post("/:targetType/:targetId", createCommentValidator, validateRequest, createComment);

// PATCH /api/v1/comments/:commentId
router.patch("/:commentId", updateCommentValidator, validateRequest, updateComment);

// DELETE /api/v1/comments/:commentId
router.delete("/:commentId", deleteComment);

export default router;
