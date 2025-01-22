import { Server as WebSocketServer, WebSocket } from "ws";
import http from "http";
import User from "../schema/user";

interface Message {
  longitude: number;
  latitude: number;
  email: string;
}

interface Chauffeur {
  email: string;
  longitude: number;
  latitude: number;
}

interface Client {
  email: string;
  longitude: number;
  latitude: number;
}

interface Association {
  chauffeur: Chauffeur;
  client: Client;
}

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
  const AllClient: Client[] = [];
  const AssocALL: Association[] = [];

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

  const updateClientList = (newClient: Client) => {
    const index = AllClient.findIndex(
      (client) => client.email === newClient.email
    );

    if (index !== -1) {
      AllClient[index] = newClient;
    } else {
      AllClient.push(newClient);
    }
  };

  const associateClientsToChauffeurs = () => {
    AssocALL.length = 0;

    AllChauffeur.forEach((chauffeur) => {
      let closestClient: Client | null = null;
      let minDistance = Infinity;

      AllClient.forEach((client) => {
        const distance = calculateDistance(
          chauffeur.latitude,
          chauffeur.longitude,
          client.latitude,
          client.longitude
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestClient = client;
        }
      });

      if (closestClient) {
        AssocALL.push({ chauffeur, client: closestClient });
      }
    });
  };

  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    console.log("Un client WebSocket est connecté.");

    ws.on("message", async (data: string) => {
      try {
        const message: Message = JSON.parse(data);

        const user = await User.findOne({ email: message.email });

        if (user) {
          if (user.status) {
            if (
              message.longitude !== undefined &&
              message.latitude !== undefined
            ) {
              updateChauffeurList({
                email: message.email,
                longitude: message.longitude,
                latitude: message.latitude,
              });

              associateClientsToChauffeurs();

              ws.send(
                JSON.stringify({
                  chauffeurs: AllChauffeur,
                  associations: AssocALL,
                })
              );
            } else {
              ws.send("Erreur : Propriétés longitude et latitude manquantes.");
            }
          } else {
            if (
              message.longitude !== undefined &&
              message.latitude !== undefined
            ) {
              updateClientList({
                latitude: message.latitude,
                email: message.email,
                longitude: message.longitude,
              });

              associateClientsToChauffeurs();

              ws.send(
                JSON.stringify({
                  clients: AllClient,
                  associations: AssocALL,
                })
              );
            } else {
              ws.send("Erreur : Propriétés longitude et latitude manquantes.");
            }
          }
        } else {
          ws.send("Utilisateur non trouvé");
        }
      } catch (err) {
        ws.send("Champ invalide");
      }
    });

    ws.on("close", () => {
      console.log("Le client WebSocket s'est déconnecté.");
    });

    ws.send("Bienvenue sur le serveur WebSocket!");
  });

  console.log("Serveur WebSocket initialisé.");
};
