"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const email_route_1 = __importDefault(require("./routes/email.route"));
const mongoose_1 = __importDefault(require("./config/mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
(0, dotenv_1.configDotenv)({ path: ".env" });
const app = (0, express_1.default)();
const port = process.env.PORT;
(0, mongoose_1.default)();
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
const assetsPath = path_1.default.join(__dirname, 'assets');
app.use('/assets', express_1.default.static(assetsPath));
app.use("/users", user_route_1.default);
app.use("/auth", auth_route_1.default);
app.use("/email", email_route_1.default);
app.listen(port, () => {
    console.log(`Connected to mongodb://${port}`);
});
