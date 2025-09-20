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
const crypto_1 = require("crypto");
const reservation_1 = __importDefault(require("../schema/reservation"));
const initializeWebSocket = (server) => {
    const AllChauffeur = [];
    const ClientList = [];
    const updateChauffeurList = (newChauffeur) => {
        const index = AllChauffeur.findIndex((chauffeur) => chauffeur.email === newChauffeur.email);
        if (index !== -1) {
            AllChauffeur[index] = newChauffeur;
        }
        else {
            AllChauffeur.push(newChauffeur);
        }
    };
    const removeChauffeur = (clientID) => {
        const index = AllChauffeur.findIndex((chauffeur) => chauffeur.id === clientID);
        if (index !== -1) {
            console.log(`Suppression du chauffeur: ${AllChauffeur[index].email}`);
            AllChauffeur.splice(index, 1);
        }
    };
    const getClientList = () => __awaiter(void 0, void 0, void 0, function* () {
        const allReservation = yield reservation_1.default.find({});
        ClientList.length = 0; // Réinitialise le tableau avant de le remplir
        for (const reservation of allReservation) {
            if (reservation.user) {
                const user = yield user_1.default.findOne({ _id: reservation.user });
                if (user) {
                    const newUser = {
                        longitude: reservation.userLongitude,
                        latitude: reservation.userLatitude,
                        email: user.email,
                    };
                    ClientList.push(newUser);
                }
            }
        }
    });
    const wss = new ws_1.Server({ server });
    wss.on("connection", (ws) => {
        const clientID = (0, crypto_1.randomUUID)();
        console.log("Un client WebSocket est connecté.", clientID);
        ws.on("message", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const message = JSON.parse(data);
                const user = yield user_1.default.findOne({ email: message.email });
                if (user) {
                    if (user.status === true) {
                        if (message.longitude !== undefined &&
                            message.latitude !== undefined) {
                            yield getClientList();
                            updateChauffeurList({
                                id: clientID,
                                email: message.email,
                                longitude: message.longitude,
                                latitude: message.latitude,
                            });
                            ws.send(JSON.stringify({
                                chauffeurs: AllChauffeur,
                                clients: ClientList,
                            }));
                            console.log(AllChauffeur);
                        }
                        else {
                            ws.send("Erreur : Propriétés longitude et latitude manquantes.");
                        }
                    }
                    else {
                        ws.send("Utilisateur désactivé ou inactif.");
                    }
                }
                else {
                    ws.send("Utilisateur non trouvé.");
                }
            }
            catch (err) {
                console.error("Erreur lors de l'analyse du message :", err);
                ws.send("Erreur : Champ invalide.");
            }
        }));
        ws.on("close", () => {
            console.log("Le client WebSocket s'est déconnecté.");
            removeChauffeur(clientID);
        });
        ws.send("Bienvenue sur le serveur WebSocket!");
    });
    console.log("Serveur WebSocket initialisé.");
};
exports.initializeWebSocket = initializeWebSocket;
