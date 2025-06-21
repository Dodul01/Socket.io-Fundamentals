import { Router } from "express";
import { UserRouter } from "../models/User/user.router";
import { AuthRouter } from "../models/Auth/auth.route";

const router = Router();

const moduleRoutes = [
    {
        path: '/users',
        router: UserRouter,
    },
    {
        path: '/auth',
        router: AuthRouter
    }
]

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;