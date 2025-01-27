import { Server as WebSocketServer, WebSocket } from "ws";
import http from "http";
import User from "../schema/user";
import { randomUUID } from "crypto";
import Reservation from "../schema/reservation";

interface Message {
  longitude: number;
  latitude: number;
  email: string;
}

interface Chauffeur {
  id: string;
  email: string;
  longitude: number;
  latitude: number;
}

interface Client {
  longitude: number;
  latitude: number;
  email: string;
}

// Fonction pour calculer la distance entre deux points géographiques
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Initialisation du WebSocket
export const initializeWebSocket = (server: http.Server) => {
  const AllChauffeur: Chauffeur[] = [];
  const ClientList: Client[] = [];

  // Met à jour la liste des chauffeurs
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

  // Récupère la liste des clients à partir des réservations
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

  // Création du serveur WebSocket
  const wss = new WebSocketServer({ server });

  // Gestion des connexions WebSocket
  wss.on("connection", (ws: WebSocket) => {
    const clientID = randomUUID();
    console.log("Un client WebSocket est connecté.", clientID);

    // Gestion des messages reçus
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
              // Récupère la liste des clients et met à jour les chauffeurs
              await getClientList();
              updateChauffeurList({
                id: clientID,
                email: message.email,
                longitude: message.longitude,
                latitude: message.latitude,
              });

              // Envoie les listes mises à jour au client WebSocket
              ws.send(
                JSON.stringify({
                  chauffeurs: AllChauffeur,
                  clients: ClientList,
                })
              );
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

    // Gestion de la déconnexion
    ws.on("close", () => {
      console.log("Le client WebSocket s'est déconnecté.");
    });

    // Envoi d'un message de bienvenue au client
    ws.send("Bienvenue sur le serveur WebSocket!");
  });

  console.log("Serveur WebSocket initialisé.");
};
