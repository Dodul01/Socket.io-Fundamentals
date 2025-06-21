import { Request, Response } from "express";
import { AuthServices } from "./auth.service";

const loginUser = async (req: Request, res: Response) => {
    try {
        const result = await AuthServices.loginUser(req.body);
        const { jwtToken } = result;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            statusCode: 200,
            data: {
                token: jwtToken,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status((error as any).statusCode || 400).json({
                success: false,
                message: error.message || 'An error occurred',
                statusCode: (error as any).statusCode || 400,
                error: (error as any).details || null,
                stack: error.stack,
            });
        } else {
            res.status((error as any).statusCode).json({
                success: false,
                message: (error as any).message,
                statusCode: (error as any).statusCode,
                error: error,
                stack: (error as any).stack,
            });
        }
    }
}

export const AuthControllers = {
    loginUser
}