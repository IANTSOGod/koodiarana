import { Router, Request, Response } from "express";
import User from "../schema/user";
import Reservation from "../schema/reservation";

const router = Router();

router.post("/create", async (req: Request, res: Response) => {
  const {
    localisation,
    clientId,
    clientLatitude,
    clientLongitude,
    destination,
    description,
  } = req.body;
  try {
    const client = await User.findOne({ _id: clientId, status: false });
    if (
      client &&
      localisation &&
      clientLatitude &&
      clientLongitude &&
      destination &&
      description
    ) {
      const reservation = await Reservation.create({
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
    } else {
      res.status(401).json({ message: "Champ incomplet" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.post("/assignChauffeur", async (req: Request, res: Response) => {
  const { _id, email } = req.body;
  try {
    const reservation = await Reservation.findOne({ _id: _id });
    if (reservation) {
      const user = await User.findOne({ email: email, status: true });
      if (user) {
        reservation.chauffeur = user._id;
        await reservation.save();
        res.status(200).json(reservation);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } else {
      res.status(404).json({ message: "Reservation non existant" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

export default router;
