import { param, body } from "express-validator";
import { validateObjectId } from "../utils/validateObjectId.js";

function convertToString(value = "") {
    return value?.toString().trim() || "";
}

// Create comment validator
export const createCommentValidator = [
    param("targetType")
        .isIn(["video", "tweet"])
        .withMessage("Bad request: targetType must be either 'video' or 'tweet'"),
    param("targetId").custom((value) => validateObjectId(value, "Comment")),
    body("content")
        .customSanitizer(convertToString)
        .notEmpty()
        .withMessage("Comment content cannot be empty"),
];

// Update comment validator
export const updateCommentValidator = [
    param("commentId").custom((value) => validateObjectId(value, "Comment")),
    body("content")
        .customSanitizer(convertToString)
        .notEmpty()
        .withMessage("Comment content cannot be empty"),
];

// Get comments validator
export const getCommentsValidator = [
    param("targetType")
        .isIn(["video", "tweet"])
        .withMessage("Bad request: targetType must be either 'video' or 'tweet'"),
    param("targetId").custom((value) => validateObjectId(value, "Target")),
];
