import { body } from "express-validator";
import { capitalize } from "../utils/capitalize.js";

// Update user account details validator
export const updateAccountDetailsValidator = [
    body("firstName")
        .optional()
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
    body("email").optional().isEmail().withMessage("Please provide a valid email id").trim(),
];
