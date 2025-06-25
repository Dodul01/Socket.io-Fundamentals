import { JsonWebTokenError } from "jsonwebtoken";
import socketHelper from "../../helpers/socketHelper";
import { IVerifyEmail } from "./user";
import { TUser } from "./user.interface";
import { User } from "./user.model";
import { StatusCodes } from 'http-status-codes';
import cryptoToken from "../../utils/cryptoTOken";
import { jwtHelper } from "../../helpers/jwtHelper";


const JWT_SECRET = '1f0daf15f0eb36b336e7cbc742c0165b4c30b59efb6336';

const createUserIntoDB = async (user: TUser) => {
    /**     TODO
     * STEP 1: Check if the user exsist if exsist throw error else let the user create account 
     * STEP 2: send otp by email
     */


    const result = await User.create(user);

    // emit user created event 
    const io = socketHelper.getIO();

    io.emit('user:created', {
        id: user.email,
        name: user.name,
        email: user.email,
    })

    return result;
}

const verifyEmailToDB = async (payload: IVerifyEmail) => {
    const { email, oneTimeCode } = payload;

    const isUserExist = await User.findOne({ email }).select('+authentifation');

    if (!isUserExist) {
        throw new Error("User doesn't exist!");
    }

    if (!oneTimeCode) {
        throw new Error('Please give the otp, check your email we send a code');
    }

    if (isUserExist.authentifation?.oneTimePassword !== oneTimeCode) {
        throw new Error('You provided wrong otp');
    }

    const date = new Date();

    if (!isUserExist.authentifation?.expireAt) {
        throw new Error('OTP expiration date is missing.');
    }

    if (date > isUserExist.authentifation.expireAt) {
        throw new Error('OTP already expired, Please try again.');
    }

    let message;
    let verifyToken;
    let accessToken;
    let user;

    if (!isUserExist.isVerifyed) {
        await User.findByIdAndUpdate({ _id: isUserExist._id }, { isVerifyed: true, authentifation: { oneTimeCode: null, expireAt: null } })

        // create token
        accessToken = jwtHelper.createToken(
            { id: isUserExist._id, email: isUserExist.email },
            JWT_SECRET,
            '1h'
        )
        message = 'Email verify successfully';
        user = await User.findById(isUserExist._id);
    } else {
        await User.findOneAndUpdate({ _id: isUserExist._id }, { authentication: { isResetPassword: true, oneTimeCode: null, expireAt: null } });
        //create token ;
        const createToken = cryptoToken();
        // await ResetToken.create({ user: isExistUser._id, token: createToken, expireAt: new Date(Date.now() + 5 * 60000) });

        message = 'Verification Successful: Please securely store and utilize this code for reset password';
          verifyToken = createToken;
    }

    return {verifyToken, message, accessToken, user};
}

export const UserService = {
    createUserIntoDB,
    verifyEmailToDB,
}