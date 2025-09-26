import { body } from "express-validator";

// Publish a video validator
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
