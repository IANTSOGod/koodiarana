import mongoose from "mongoose";
const currentDate = new Date(Date.now());

const reservationSchema = new mongoose.Schema(
  {
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    chauffeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chauffeur"
    },
    localisation:{
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
  },
  {
    collection: "Reservation",
  }
);

const Reservation = mongoose.model("Reservation", reservationSchema);

export default Reservation;
