import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const userSchema = new Schema(
    {
        username: {
            type: String,
            lowercase: true,
            unique: true,
            trim: true,
            index: true,
            immutable: true,
            required: true,
        },
        email: {
            type: String,
            lowercase: true,
            unique: true,
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

userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
    },
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Unable to process password at the moment. Please try again."
        );
    }
});

userSchema.methods.isPasswordCorrect = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Unable to verify credentials at the moment. Please try again."
        );
    }
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({ _id: this._id, username: this.username }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
};

const User = model("User", userSchema);
export default User;
