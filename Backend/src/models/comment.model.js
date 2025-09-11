import { Schema, model } from "mongoose";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            maxLength: 150,
            trim: true,
            required: true,
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
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
