import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import {
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
} from "../controllers/user.controller.js";
import { updateAccountDetailsValidator } from "../validators/user.validators.js";
import { validateRequest } from "../middlewares/validator.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

// Authenticate user
router.use(authUser);

// GET /api/v1/users/me
router.get("/me", getCurrentUser);

// PATCH /api/v1/users/me
router.patch("/me", updateAccountDetailsValidator, validateRequest, updateAccountDetails);

// PATCH /api/v1/users/me/avatar
router.patch("/me/avatar", upload.single("avatar"), updateUserAvatar);

// PATCH /api/v1/users/me/cover-image
router.patch("/me/cover-image", upload.single("coverImage"), updateUserCoverImage);

export default router;
