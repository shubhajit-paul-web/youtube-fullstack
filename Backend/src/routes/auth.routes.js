import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
} from "../controllers/auth.controller.js";
import {
    registerValidator,
    loginValidator,
    changeCurrentPasswordValidator,
} from "../validators/auth.validators.js";
import { validateRequest } from "../middlewares/validator.middleware.js";
import { authUser } from "../middlewares/auth.middleware.js";

const router = Router();

// POST /api/v1/auth/register
router.post(
    "/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerValidator,
    validateRequest,
    registerUser
);

// POST /api/v1/auth/login
router.post("/login", loginValidator, validateRequest, loginUser);

// GET /api/v1/auth/logout
router.get("/logout", authUser, logoutUser);

// GET /api/v1/auth/refresh-token
router.get("/refresh-token", refreshAccessToken);

// PATCH /api/v1/auth/change-password
router.patch(
    "/change-password",
    authUser,
    changeCurrentPasswordValidator,
    validateRequest,
    changeCurrentPassword
);

// GET /api/v1/auth/user
router.get("/user", authUser, getCurrentUser);

export default router;
