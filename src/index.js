 import dotenv from "dotenv";
 import connectDB from "./db/db.js";   // database connection file
 import {app} from "./app.js";             // express app file

 dotenv.config({
    path: "./.env"   // specify custom path to env file
 })

connectDB()
.then(() => {
     app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
     });
})
.catch((err) => {
     console.log("Failed to connect DB", err);
});