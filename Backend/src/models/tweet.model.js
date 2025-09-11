import { Schema, model } from "mongoose";

const tweetSchema = new Schema(
    {
        content: {
            type: String,
            trim: true,
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

const Tweet = model("Tweet", tweetSchema);
export default Tweet;
