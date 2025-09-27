import { body, param } from "express-validator";
import { validateObjectId } from "../utils/validateObjectId.js";

// Publish video validator
export const publishAVideoValidator = [
    body("title")
        .notEmpty()
        .withMessage("Title is required")
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage("Title must be between 5 and 100 characters"),
    body("description")
        .notEmpty()
        .withMessage("Description is required")
        .trim()
        .isLength({ min: 5, max: 500 })
        .withMessage("Description must be between 5 and 500 characters"),
];

// Update video validator
export const updateVideoValidator = [
    param("id").custom((value) => validateObjectId(value, "Video")),
    body("title")
        .optional()
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage("Title must be between 5 and 100 characters"),
    body("description")
        .optional()
        .trim()
        .isLength({ min: 5, max: 500 })
        .withMessage("Description must be between 5 and 500 characters"),
];
