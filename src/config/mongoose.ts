import mongoose from "mongoose";
import { configDotenv } from "dotenv";

configDotenv({ path: ".env" });
const databaseURL = process.env.DATABASE as string;

const Mongo = async () => {
  try {
    await mongoose.connect(databaseURL);
    console.log(`Connected at ${databaseURL}`);
  } catch (error) {
    console.log(error);
  }
};

export default Mongo;
