import { configDotenv } from "dotenv";
import express from "express";
import UserRoute from "../src/routes/user.route";
import AuthRoute from "../src/routes/auth.route";
import EmailRoute from "../src/routes/email.route";
import Mongo from "./config/mongoose";
import bodyParser from "body-parser";

configDotenv({ path: ".env" });

const app = express();
const port = process.env.PORT;

Mongo();

app.use(express.json());
app.use(bodyParser.json());
app.use("/users", UserRoute);
app.use("/auth", AuthRoute);
app.use("/email", EmailRoute);

app.listen(port, () => {
  console.log(`Connected to mongodb://${port}`);
});
