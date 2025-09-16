import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        throw new Error(`Bcrypt hashing error: ${error.message}`);
    }
});

userSchema.methods.isPasswordCorrect = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new Error(`Bcrypt comparing error: ${error.message}`);
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
