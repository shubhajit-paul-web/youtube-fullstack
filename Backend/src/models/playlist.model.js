import { Schema, model } from "mongoose";

const playlistSchema = new Schema(
    {
        name: {
            type: String,
            maxLength: 50,
            trim: true,
            required: true,
        },
        description: {
            type: String,
            maxLength: 250,
            trim: true,
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
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

const Playlist = model("Playlist", playlistSchema);
export default Playlist;
