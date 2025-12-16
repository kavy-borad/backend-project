import mongoose  from "mongoose";
import { DB_NAME } from "../constants.js"; // database name constant

const connectDB = async () => {
  
    try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)  // mongoose connection method

      console.log(`\n mongodb connected !! ${connectionInstance.connection.host}`); // success message

    } catch (error) {
        console.log("MONGODB connection Failed ", error);
        process.exit(1)
    }
}
export default connectDB