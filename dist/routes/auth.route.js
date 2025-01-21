"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = __importDefault(require("../schema/user"));
const bcrypt_1 = require("bcrypt");
const router = (0, express_1.Router)();
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield user_1.default.findOne({
            email: email,
        });
        if (user) {
            const isPasswordValid = yield (0, bcrypt_1.compare)(password, user.password);
            if (isPasswordValid) {
                if (user.emailVerified) {
                    res.status(200).json({ message: "Login success" });
                }
                else {
                    res.status(401).json({ message: "Email non vérifié" });
                }
            }
            else {
                res.status(401).json({ message: "Invalid password" });
            }
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        res.status(500).json(error);
    }
}));
exports.default = router;
