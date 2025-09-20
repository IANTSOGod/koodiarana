"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const currentDate = new Date(Date.now());
const reservationSchema = new mongoose_1.default.Schema({
    date: {
        type: Date,
        required: true,
        default: currentDate,
    },
    heure: {
        type: String,
        required: true,
        default: currentDate.getHours() + ":" + currentDate.getMinutes(),
    },
    status: {
        type: Boolean,
        required: true,
        default: false,
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Client",
    },
    chauffeur: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Chauffeur"
    },
    localisation: {
        type: String,
        required: true,
    },
    userLongitude: {
        type: Number,
        required: true,
    },
    userLatitude: {
        type: Number,
        required: true,
    },
    userDestination: {
        type: String,
        required: true,
    },
    userDescription: {
        type: String,
        required: true,
    },
}, {
    collection: "Reservation",
});
const Reservation = mongoose_1.default.model("Reservation", reservationSchema);
exports.default = Reservation;
