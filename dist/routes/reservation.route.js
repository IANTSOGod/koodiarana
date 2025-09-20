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
const reservation_1 = __importDefault(require("../schema/reservation"));
const router = (0, express_1.Router)();
router.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { localisation, clientId, clientLatitude, clientLongitude, destination, description, } = req.body;
    try {
        const client = yield user_1.default.findOne({ _id: clientId, status: false });
        if (client &&
            localisation &&
            clientLatitude &&
            clientLongitude &&
            destination &&
            description) {
            const reservation = yield reservation_1.default.create({
                user: client.id,
                userLatitude: clientLatitude,
                userLongitude: clientLongitude,
                userDestination: destination,
                userDescription: description,
                localisation: localisation,
            });
            if (reservation) {
                res.status(201).json(reservation);
            }
        }
        else {
            res.status(401).json({ message: "Champ incomplet" });
        }
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
router.post("/assignChauffeur", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id, email } = req.body;
    try {
        const reservation = yield reservation_1.default.findOne({ _id: _id });
        if (reservation) {
            const user = yield user_1.default.findOne({ email: email, status: true });
            if (user) {
                reservation.chauffeur = user._id;
                yield reservation.save();
                res.status(200).json(reservation);
            }
            else {
                res.status(404).json({ message: "User not found" });
            }
        }
        else {
            res.status(404).json({ message: "Reservation non existant" });
        }
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
exports.default = router;
