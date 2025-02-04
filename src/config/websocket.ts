import { Server as WebSocketServer, WebSocket } from "ws";
import http from "http";
import User from "../schema/user";
import { randomUUID } from "crypto";
import Reservation from "../schema/reservation";
import Message from "../config/interfaces/Message";
import Chauffeur from "./interfaces/Chauffeur";
import Client from "./interfaces/Client";
import calculateDistance from "./distanceCalc";

export const initializeWebSocket = (server: http.Server) => {
  const AllChauffeur: Chauffeur[] = [];
  const ClientList: Client[] = [];

  const updateChauffeurList = (newChauffeur: Chauffeur) => {
    const index = AllChauffeur.findIndex(
      (chauffeur) => chauffeur.email === newChauffeur.email
    );

    if (index !== -1) {
      AllChauffeur[index] = newChauffeur;
    } else {
      AllChauffeur.push(newChauffeur);
    }
  };

  const removeChauffeur = (clientID: string) => {
    const index = AllChauffeur.findIndex(
      (chauffeur) => chauffeur.id === clientID
    );
    if (index !== -1) {
      console.log(`Suppression du chauffeur: ${AllChauffeur[index].email}`);
      AllChauffeur.splice(index, 1);
    }
  };

  const getClientList = async () => {
    const allReservation = await Reservation.find({});
    ClientList.length = 0; // Réinitialise le tableau avant de le remplir

    for (const reservation of allReservation) {
      if (reservation.user) {
        const user = await User.findOne({ _id: reservation.user });
        if (user) {
          const newUser: Client = {
            longitude: reservation.userLongitude,
            latitude: reservation.userLatitude,
            email: user.email,
          };
          ClientList.push(newUser);
        }
      }
    }
  };

  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    const clientID = randomUUID();
    console.log("Un client WebSocket est connecté.", clientID);

    ws.on("message", async (data: string) => {
      try {
        const message: Message = JSON.parse(data);

        const user = await User.findOne({ email: message.email });

        if (user) {
          if (user.status === true) {
            if (
              message.longitude !== undefined &&
              message.latitude !== undefined
            ) {
              await getClientList();
              updateChauffeurList({
                id: clientID,
                email: message.email,
                longitude: message.longitude,
                latitude: message.latitude,
              });

              ws.send(
                JSON.stringify({
                  chauffeurs: AllChauffeur,
                  clients: ClientList,
                })
              );
              console.log(AllChauffeur);
            } else {
              ws.send("Erreur : Propriétés longitude et latitude manquantes.");
            }
          } else {
            ws.send("Utilisateur désactivé ou inactif.");
          }
        } else {
          ws.send("Utilisateur non trouvé.");
        }
      } catch (err) {
        console.error("Erreur lors de l'analyse du message :", err);
        ws.send("Erreur : Champ invalide.");
      }
    });

    ws.on("close", () => {
      console.log("Le client WebSocket s'est déconnecté.");
      removeChauffeur(clientID);
    });

    ws.send("Bienvenue sur le serveur WebSocket!");
  });

  console.log("Serveur WebSocket initialisé.");
};
