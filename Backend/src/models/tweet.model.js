import { Schema, model } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const tweetSchema = new Schema(
    {
        content: {
            type: String,
            trim: true,
            maxLength: 500,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

tweetSchema.pre("save", async (next) => {
    if (this.content?.trim().length > 500) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Maximum comment length exceeded: limit is 500 characters"
        );
    }

    next();
});

const Tweet = model("Tweet", tweetSchema);
export default Tweet;
