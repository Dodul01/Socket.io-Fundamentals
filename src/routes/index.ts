import { Router } from "express";
import { UserRouter } from "../models/User/user.router";
import { AuthRouter } from "../models/Auth/auth.route";
import { NotificationRouter } from "../models/notification/notification.router";
import { MessageRouter } from "../models/Message/message.route";

const router = Router();

const moduleRoutes = [
    {
        path: '/users',
        router: UserRouter,
    },
    {
        path: '/auth',
        router: AuthRouter
    },
    {
        path: '/message',
        router: MessageRouter,
    },
    {
        path: '/notification',
        router: NotificationRouter,
    }
]

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;