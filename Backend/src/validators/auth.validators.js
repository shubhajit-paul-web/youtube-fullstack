import { body } from "express-validator";
import { capitalize } from "../utils/capitalize.js";

// Register validator
export const registerValidator = [
    body("username")
        .notEmpty()
        .withMessage("Username is required")
        .isLength({ min: 5, max: 25 })
        .withMessage("Username must be 5-25 characters")
        .toLowerCase()
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage("Username can only contain letters, numbers, and underscores")
        .trim(),
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email id")
        .trim(),
    body("firstName")
        .notEmpty()
        .withMessage("First name is required")
        .matches(/^[A-Za-z]+$/)
        .withMessage("First name must contain only letters")
        .trim()
        .customSanitizer(capitalize),
    body("lastName")
        .optional()
        .matches(/^[A-Za-z]+$/)
        .withMessage("Last name must contain only letters")
        .trim()
        .customSanitizer(capitalize),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isStrongPassword({ minSymbols: 0 })
        .withMessage(
            "Weak password: must be at least 8 chars, include uppercase, lowercase & number"
        )
        .trim(),
];

// Login validator
export const loginValidator = [
    body("identifier").notEmpty().withMessage("Email or username is required").trim(),
    body("password").notEmpty().withMessage("Password is required").trim(),
];

// Change current password validator
export const changeCurrentPasswordValidator = [
    body("newPassword")
        .notEmpty()
        .withMessage("New Password is required")
        .isStrongPassword({ minSymbols: 0 })
        .withMessage(
            "Weak password: must be at least 8 chars, include uppercase, lowercase & number"
        )
        .trim(),
    body("confirmPassword")
        .notEmpty()
        .withMessage("Confirm Password is required")
        .isStrongPassword({ minSymbols: 0 })
        .withMessage(
            "Weak password: must be at least 8 chars, include uppercase, lowercase & number"
        )
        .trim(),
];
