import { body } from "express-validator";

// Subscribe channel validator
export const subscribeChannelValidator = [
    body("channelId").notEmpty().withMessage("channel Id is required").trim(),
];
