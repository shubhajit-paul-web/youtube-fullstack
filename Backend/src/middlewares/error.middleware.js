import { StatusCodes } from "http-status-codes";

// Error-handling middleware
export async function errorHandler(err, req, res, next) {
    console.error("Error caught:", err);

    const statusCode = err.StatusCode || StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
        success: false,
        statusCode,
        message: err.message || "Internal server error",
    });
}
