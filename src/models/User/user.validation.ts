import { z } from "zod";

const userValidationSchema = z.object({
    name: z.string({
        required_error: "Name is required.",
        invalid_type_error: "Name must be a string",
    }),
    email: z.string({
        required_error: "Email is required.",
        invalid_type_error: "Email must be a string."
    }).email({ message: "invalid Email." }),
    password: z.string({
        required_error: "Password is required.",
        invalid_type_error: "Password must be a string",
    }).min(6, { message: "Password must be a t last 6 characters." }).max(20, { message: "password can't be more then 20 characters." })
});

export const userValidation = {
    userValidationSchema,
}