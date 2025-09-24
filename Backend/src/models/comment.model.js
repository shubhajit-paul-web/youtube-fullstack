import { Schema, model } from "mongoose";

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
            maxLength: 100,
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

const Comment = model("Comment", commentSchema);
export default Comment;
