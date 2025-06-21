import { z } from "zod";

export const loginValidationSchema = z.object({
    email: z.string({ required_error: "Email is required.", invalid_type_error: "Email must be a string."}).email("Invalid Email."),
    password: z.string({required_error: "Password is required.", invalid_type_error: "Password must be a string"}).min(6, "Password must be at last 6 characters.").max(20, "Password can't be more then  20 characters.")
});
