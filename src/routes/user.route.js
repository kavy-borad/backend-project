import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();



router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )


     
    // login route
    router.route("/login").post(loginUser)
    // logout route
    router.route("/logout").post(authMiddleware, logoutUser)
    // refresh token route
    router.route('/refresh-token').post(refreshAccessToken)

export default router;
