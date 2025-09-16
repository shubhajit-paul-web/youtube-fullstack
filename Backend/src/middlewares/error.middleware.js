import { StatusCodes } from "http-status-codes";

// Error-handling middleware
export async function errorHandler(err, req, res, next) {
    console.error("Error caught:", err);

    res.status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message || "Internal server error",
        errors: err.errors || [],
    });
}
