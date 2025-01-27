import { Router, Request, Response } from "express";
import User from "../schema/user";
import Reservation from "../schema/reservation";

const router = Router();

router.post("/create", async (req: Request, res: Response) => {
  const {
    chauffeurId,
    clientId,
    clientLatitude,
    clientLongitude,
    destination,
    description,
  } = req.body;
  try {
    const client = await User.findOne({ _id: clientId, status: false });
    const chauffeur = await User.findOne({ _id: chauffeurId, status: true });
    if (
      client &&
      chauffeur &&
      clientLatitude &&
      clientLongitude &&
      destination &&
      description
    ) {
      const reservation = await Reservation.create({
        user: client.id,
        chauffeur: chauffeur.id,
        userLatitude: clientLatitude,
        userLongitude: clientLongitude,
        userDestination: destination,
        userDescription: description,
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

export default router;
