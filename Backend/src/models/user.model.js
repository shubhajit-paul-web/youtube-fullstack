import { Schema, Model } from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String,
            lowercase: true,
            unique: true,
            trim: true,
            index: true,
            required: true,
        },
        email: {
            type: String,
            lowercase: true,
            unique: true,
            immutable: true,
            trim: true,
            required: true,
        },
        fullName: {
            firstName: {
                type: String,
                trim: true,
                required: true,
            },
            lastName: {
                type: String,
                trim: true,
            },
        },
        avatar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        password: {
            type: String,
            minLength: 8,
            trim: true,
            required: true,
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const User = Model("User", userSchema);
export default User;
