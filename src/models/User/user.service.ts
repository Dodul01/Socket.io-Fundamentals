import { JsonWebTokenError } from "jsonwebtoken";
import socketHelper from "../../helpers/socketHelper";
import { IVerifyEmail } from "./user";
import { TUser } from "./user.interface";
import { User } from "./user.model";
import { jwtHelper } from "../../helpers/jwtHelper";
import cryptoToken from "../../utils/cryptoToken";
import { generateOTP } from "../../utils/generateOTP";
import { createAccount, emailTemplate } from "../../shared/emailTemplate";
import { emailHelper } from "../../helpers/emailHelper";


const JWT_SECRET = '1f0daf15f0eb36b336e7cbc742c0165b4c30b59efb6336';

const createUserIntoDB = async (user: TUser) => {
    const userFromDB = await User.find({ email: user.email });
    /** TODO **/
    // STEP 1: Check if the user exsist if exsist throw error else let the user create account 
    
    console.log("From user service ", userFromDB);
    
    if(!userFromDB){
        throw new Error("User already already exsist.")
    }

    // STEP 2: generate otp
    const otp = generateOTP(4);

    const result = await User.create(user);

    // emit user created event 
    const io = socketHelper.getIO();

    io.emit('user:created', {
        id: user.email,
        name: user.name,
        email: user.email,
    })

    const emailData = {
        name: result.name,
        otp: String(result.authentifation?.oneTimePassword),
        email: result.email
    }

    //STEP 3: send the otp
    const createAccountTemplate = createAccount(emailData)
    emailHelper.sendEmail(createAccountTemplate);

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

    return { verifyToken, message, accessToken, user };
}

export const UserService = {
    createUserIntoDB,
    verifyEmailToDB,
}