import { Router } from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import { getCurrentUser, updateAccountDetails } from "../controllers/user.controller.js";
import { updateAccountDetailsValidator } from "../validators/user.validators.js";
import { validateRequest } from "../middlewares/validator.middleware.js";

const router = Router();

// Authenticate user
router.use(authUser);

// GET /api/v1/users/me
router.get("/me", getCurrentUser);

// PATCH /api/v1/users/me
router.patch("/me", updateAccountDetailsValidator, validateRequest, updateAccountDetails);

export default router;
