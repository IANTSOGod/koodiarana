import { configDotenv } from "dotenv";
import express from "express";
import UserRoute from "./routes/user.route";
import AuthRoute from "./routes/auth.route";
import EmailRoute from "./routes/email.route";
import Mongo from "./config/mongoose";
import bodyParser from "body-parser";
import path from "path";

configDotenv({ path: ".env" });

const app = express();
const port = process.env.PORT;

Mongo();

app.use(express.json());
app.use(bodyParser.json());
const assetsPath = path.join(__dirname, 'assets');
app.use('/assets', express.static(assetsPath));
app.use("/users", UserRoute);
app.use("/auth", AuthRoute);
app.use("/email", EmailRoute);

app.listen(port, () => {
  console.log(`Connected to mongodb://${port}`);
});
