import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, getChannelprofile } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { Verifyjwt  } from "../middlewares/auth.middleware.js";

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
    router.route("/logout").post(Verifyjwt, logoutUser)
    // refresh token route
    router.route('/refresh-token').post(refreshAccessToken)
    router.route('/channel/:id').get(Verifyjwt, getChannelprofile)

export default router;
