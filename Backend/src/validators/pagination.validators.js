import { query } from "express-validator";

// Pagination validator
export const paginationValidator = [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ max: 50 }).withMessage("Limit must be between 1 and 50"),
    query("query")
        .optional()
        .isString()
        .withMessage("Search query must be a string")
        .isLength({ min: 2, max: 50 })
        .withMessage("Search query must be 2-50 characters long"),
    query("sortBy").optional().isIn(["views", "createdAt"]).withMessage("Invalid sort field"),
    query("sortType").optional().isIn(["asc", "desc"]).withMessage("Sort type must be asc or desc"),
];
