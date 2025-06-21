import express from "express";
import { AuthControllers } from "./auth.controller";

const router = express.Router();

router.post('/sign-in', AuthControllers.loginUser);

export const AuthRouter = router;