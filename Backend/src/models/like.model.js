import { Schema, model } from "mongoose";

const likeSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet",
        },
    },
    {
        timestamps: true,
    }
);

const Like = model("Like", likeSchema);
export default Like;
