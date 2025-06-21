import { model, Schema } from "mongoose";
import { TUser } from "./user.interface";
import bcrypt from 'bcrypt';

const bcryptSaltRounds = 12;

const userSchema = new Schema<TUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) return next();

    const hashedPassword = await bcrypt.hash(
        this.password as string,
        Number(bcryptSaltRounds),
    )
    this.password = hashedPassword;
    next();
});

userSchema.post('save', function (doc, next) {
    doc.password = '';
    next();
});

export const User = model<TUser>("User", userSchema);