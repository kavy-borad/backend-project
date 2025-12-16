import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// initialize express app
const app = express();


//middlewares and configurations
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static("public"));
app.use(cookieParser())


// import routes  


import userRouter from './routes/user.route.js';                         // import user routes

app.use("/api/v1/users", userRouter);                                    // user routes middleware

export {app};