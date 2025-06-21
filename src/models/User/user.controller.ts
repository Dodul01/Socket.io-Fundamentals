import { Request, Response } from "express";
import { userValidation } from "./user.validation";
import { UserService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
    try {
        const user = req.body;
        const zodPerseUser = userValidation.userValidationSchema.parse(user)
        const result = await UserService.createUserIntoDB(zodPerseUser)

        res.status(200).send({
            success: true,
            message: "User created succesfully.",
            result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Something went wrong',
            statusCode: 400,
            error: error,
            stack: (error as Error).stack,
        });
    }
};

export const UserControllers = {
    createUser,
}