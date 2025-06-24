import { User } from "../User/user.model";
import { TLoginUser } from "./auth.interface";
import bcrypt from 'bcrypt';
import { createToken } from "./auth.utils";
import socketHelper from "../../helpers/socketHelper";
import { IVerifyEmail } from "../User/user";

const jwt_Token = '091b2c529dec033b5ff4531e622ea3f93170e045222963319662b7e4a34f0cdd';
const jwt_access_expiry = '10d';


export const loginUser = async (payload: TLoginUser) => {
    const { email, password } = payload;

    const user = await User.findOne({ email });

    // Check if the user exsist
    if (!user) {
        throw {
            message: 'User not found',
            statusCode: 404,
            details: {
                field: 'identifier',
                issue: 'No user exists with the given email or phone',
            },
        }
    }

    // Check if the password is set or not 
    if (!user.password) {
        throw {
            message: 'Invalid credentials',
            statusCode: 401,
            details: {
                field: 'password',
                issue: 'Password is not set for this user',
            },
        };
    }

    // Compare the provided password with the stored hash
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        throw {
            message: "Invalid Credentials.",
            statusCode: 401,
            details: {
                field: "password",
                issue: "The provided password is incorrect."
            }
        }
    }

    const io = socketHelper.getIO();

    io.emit("user:login", {
        email: user.email,
        name: user.name,
    })

    // prepare the payload for jwt.
    const JWTPayload = {
        name: user.name,
        email: user.email
    }

    // Create a JWT token using you helper function
    const jwtToken = createToken(JWTPayload, jwt_Token, jwt_access_expiry)

    console.log('From auth service ', user);
    

    return { jwtToken, user };
}


export const AuthServices = {
    loginUser
}