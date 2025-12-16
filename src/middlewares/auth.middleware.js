import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { APIError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const Verifyjwt = asyncHandler(async (req, res, next) => {
    // Extract token from cookie OR authorization header
    const token =
        req.cookies?.accessToken ||
        req.header("authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new APIError(401, "Access Denied! No token provided");
    }

    try {
        // Verify token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find user
        const user = await User.findById(decodedToken.id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new APIError(401, "Invalid token! User does not exist");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new APIError(401, "Invalid or expired token");
    }
});
