import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authUser = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    const userId = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(userId).lean();

    if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    req.user = user;
    next();
});
