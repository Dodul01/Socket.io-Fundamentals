import { model, Schema } from "mongoose";
import { TUser } from "./user.interface";
import bcrypt from 'bcrypt';
import { generateOTP } from "../../utils/generateOTP";

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
    },
    isVerifyed: {
        type: Boolean,
        required: false,
        default: false,
    },
    authentifation: {
        oneTimePassword: { type: String },
        expireAt: {
            type: Date,
        }
    }
}, {
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {
        const hashedPassword = await bcrypt.hash(
            this.password as string,
            Number(bcryptSaltRounds),
        )
        this.password = hashedPassword;
    }

    if(!this.authentifation?.oneTimePassword){
        this.authentifation  = {
            oneTimePassword: generateOTP(4),
            expireAt: new Date(Date.now() + 10 * 60 * 1000) // valid for 10 minutes
        }
    }

    next();
});

// Clear the password in response 
userSchema.post('save', function (doc, next) {
    doc.password = '';
    next();
});

export const User = model<TUser>("User", userSchema);