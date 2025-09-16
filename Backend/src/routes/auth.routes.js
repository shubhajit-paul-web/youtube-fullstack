import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import authControllers from "../controllers/auth.controller.js";
import { registerValidator } from "../validators/auth.validators.js";
import { validateRequest } from "../middlewares/validator.middleware.js";

const router = Router();

// POST: /api/v1/auth/register
router.post(
    "/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerValidator,
    validateRequest,
    authControllers.register
);

export default router;
