import { socketHelper } from "../../helpers/socketHelper";
import { TUser } from "./user.interface";
import { User } from "./user.model";

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

export const UserService = {
    createUserIntoDB,
}