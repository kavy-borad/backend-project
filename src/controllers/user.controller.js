import { asyncHandler } from "../utils/asyncHandlers.js";
import { APIError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import JWT from 'jsonwebtoken'



const generateAccesandRefreshTokens = async (user_id) => {      // create method to generate acess& refresh tokens

    try {
        const user = await User.findById(user_id)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken                        // store refresh token in database
        await user.save({ validateBeforeSave: false })           // save user without validation
        return { accessToken, refreshToken }

    } catch (error) {
        throw new APIError(500, "Somthing went wrong")
    }

}

const registerUser = asyncHandler(async (req, res) => {


    //FOr Registrationuser

    // Get user details from frontend
    const { fullName, email, username, password } = req.body;

    // Validation - check if any field is empty
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new APIError(400, "All fields are required");
    }

    // Check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new APIError(409, "User with email or username already exists");
    }

    // Check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;



    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }



    if (!avatarLocalPath) {
        throw new APIError(400, "Avatar file is required");
    }

    // Upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new APIError(400, "Avatar file is required");
    }

    // Create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // Remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // Check for user creation
    if (!createdUser) {
        throw new APIError(500, "Something went wrong while registering the user");
    }

    // Return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
});



// For Login user 

/*
1. insert data in reqbody
2. uername or email cheak
3. find user
4. password cheak
5. access and refresh tokens
6. send cookie
*/

const loginUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body

    if (!username && !email) {
        throw new APIError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new APIError(404, "user does not exsit")
    }


    const IsvalidPassword = await user.isPasswordCorrect(password)

    if (!IsvalidPassword) {

        throw new APIError(401, "invalid Password")
    }



    // so now create method for Access and refresh tokens above


    const { accessToken, refreshToken } = await generateAccesandRefreshTokens(user._id)



    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")         // for cookie 


    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse({
                user: loggedInUser,
                refreshToken,
                accessToken,
            }, "User logged in successfully"

            )
        )
})



// logout user

const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(req.user_id,
        {
            $set: { refreshToken: undefined }
        },
        { new: true }
    )
})


// refreshAccessToken this are use for when the Accesstoken was expire where used


/*
1.first declare asyncatokn
2.store cookie and req .body
3.after JWT veriy

*/

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new APIError(401, "unauthorized")
    }

    const decodedToken = JWT.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET) // this store in db 


    const user = await User.findById(decodedToken?._id)                   // after we got from db as decoded token

    if (!user) {
        throw new APIError(401, "invalid refreshAccessToken")
    }

    if (incomingRefreshToken !== user.refreshToken) {
        throw new APIError(401, "refreshAccessToken expired")
    }
    // genreate tokens again 
    const { accessToken, newrefeshToken } = generateAccesandRefreshTokens(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefeshToken, options)
        .json(
            new ApiResponse(200, { accessToken, refreshToken: newrefeshToken }, "acess token refreshed")
        )
})



// change currentPassword

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new APIError(400, "invalid old Password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, {}, " Password is changed successfully")
    )

})



//getCurrentUser

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(new ApiResponse(200, req.user, "user fatched succesfully"))

})


//updateAccountDetails

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { email, fullName, } = req.body

    if (!email && !fullName)
        throw new APIError(400, "required all feilds")

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
})









export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser
};