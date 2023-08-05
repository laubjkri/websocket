import { IncomingMessage } from "http";
import { WebSocket, WebSocketServer, ServerOptions, RawData } from "ws";
import { ConnectionManager } from "./connection-manager";
// import { WsMessage } from "../types/ws-message";
import { WsMessage } from "@websocket-common/types";

export class WsHandler {
    private wsServer?: WebSocketServer;
    private connectionManager?: ConnectionManager;

    initialize(options: ServerOptions) {
        this.wsServer = new WebSocketServer(options);
        this.connectionManager = new ConnectionManager();

        this.wsServer.on("listening", () => console.log(`Server listening on port ${options.port}`));
        this.wsServer.on("connection", (socket, request) => this.onSocketConnected(socket, request));        
    }

    onSocketConnected(socket: WebSocket, request: IncomingMessage) {
        console.log(`New websocket connection!`);

        // Add callbacks to connection
        socket.on("message", (data) => this.onSocketMessage(socket, data));
        socket.on("close", (code, reason) => this.onSocketClosed(socket, code, reason));

        // Add connection to the set of connections
        this.connectionManager?.add(socket, request);
    }

    onSocketMessage(socket: WebSocket, data: RawData) {
        const payload: WsMessage = JSON.parse(`${data}`);
        console.log(`Received: `, payload);

        // this.connectionManager?.send(socket, payload);
        // Send message to all:
        this.connectionManager?.sendToAll(payload);

        switch (payload.event) {
            case "chat": {
                this.connectionManager?.relayChat(socket, payload);
                break;
            }
        }
    }

    onSocketClosed(socket: WebSocket, code: number, reason: Buffer) {
        console.log(`Client has disconnected; code=${code}, reason=${reason}`);
        this.connectionManager?.remove(socket);
    }

}