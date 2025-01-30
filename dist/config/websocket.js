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
exports.initializeWebSocket = void 0;
const ws_1 = require("ws");
const user_1 = __importDefault(require("../schema/user"));
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
// Initialisation du WebSocket
const initializeWebSocket = (server) => {
    const AllChauffeur = [];
    const AllClient = [];
    const AssocALL = [];
    const updateChauffeurList = (newChauffeur) => {
        const index = AllChauffeur.findIndex((chauffeur) => chauffeur.email === newChauffeur.email);
        if (index !== -1) {
            AllChauffeur[index] = newChauffeur;
        }
        else {
            AllChauffeur.push(newChauffeur);
        }
    };
    const updateClientList = (newClient) => {
        const index = AllClient.findIndex((client) => client.email === newClient.email);
        if (index !== -1) {
            AllClient[index] = newClient;
        }
        else {
            AllClient.push(newClient);
        }
    };
    const associateClientsToChauffeurs = () => {
        AssocALL.length = 0;
        AllChauffeur.forEach((chauffeur) => {
            let closestClient = null;
            let minDistance = Infinity;
            AllClient.forEach((client) => {
                const distance = calculateDistance(chauffeur.latitude, chauffeur.longitude, client.latitude, client.longitude);
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
    const wss = new ws_1.Server({ server });
    wss.on("connection", (ws) => {
        console.log("Un client WebSocket est connecté.");
        ws.on("message", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const message = JSON.parse(data);
                const user = yield user_1.default.findOne({ email: message.email });
                if (user) {
                    if (user.status) {
                        if (message.longitude !== undefined &&
                            message.latitude !== undefined) {
                            updateChauffeurList({
                                email: message.email,
                                longitude: message.longitude,
                                latitude: message.latitude,
                            });
                            associateClientsToChauffeurs();
                            ws.send(JSON.stringify({
                                chauffeurs: AllChauffeur,
                                associations: AssocALL,
                            }));
                        }
                        else {
                            ws.send("Erreur : Propriétés longitude et latitude manquantes.");
                        }
                    }
                    else {
                        if (message.longitude !== undefined &&
                            message.latitude !== undefined) {
                            updateClientList({
                                latitude: message.latitude,
                                email: message.email,
                                longitude: message.longitude,
                            });
                            associateClientsToChauffeurs();
                            ws.send(JSON.stringify({
                                clients: AllClient,
                                associations: AssocALL,
                            }));
                            console.log(JSON.stringify({
                                clients: AllClient,
                                associations: AssocALL,
                            }));
                        }
                        else {
                            ws.send("Erreur : Propriétés longitude et latitude manquantes.");
                        }
                    }
                }
                else {
                    ws.send("Utilisateur non trouvé");
                }
            }
            catch (err) {
                ws.send("Champ invalide");
            }
        }));
        ws.on("close", () => {
            console.log("Le client WebSocket s'est déconnecté.");
        });
        ws.send("Bienvenue sur le serveur WebSocket!");
    });
    console.log("Serveur WebSocket initialisé.");
};
exports.initializeWebSocket = initializeWebSocket;
