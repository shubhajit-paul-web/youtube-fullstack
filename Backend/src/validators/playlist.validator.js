import { body } from "express-validator";

// Create playlist validator
export const createPlaylistValidator = [
    body("name")
        .notEmpty()
        .withMessage("Playlist name is required")
        .trim()
        .isLength({ min: 5, max: 50 })
        .withMessage("Playlist name must be between 5 and 50 characters"),
    body("description")
        .optional()
        .trim()
        .isLength({ min: 5, max: 250 })
        .withMessage("Playlist Description must be between 5 and 250 characters"),
];

// Update playlist validator
export const updatePlaylistValidator = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 5, max: 50 })
        .withMessage("Playlist name must be between 5 and 50 characters"),
    body("description")
        .optional()
        .trim()
        .isLength({ min: 5, max: 250 })
        .withMessage("Playlist Description must be between 5 and 250 characters"),
];
