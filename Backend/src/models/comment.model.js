import { Schema, model } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const commentSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",
        },
        content: {
            type: String,
            maxLength: 250,
            trim: true,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

commentSchema.pre("save", async function (next) {
    if (this.content?.trim().length > 250) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Maximum comment length exceeded: limit is 250 characters"
        );
    }

    next();
});

const Comment = model("Comment", commentSchema);
export default Comment;
