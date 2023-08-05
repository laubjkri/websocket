import { WebSocket } from "ws";
import { WsMessage, User, SystemNotice, LoginMessage, ChatMessage, ChatRelayMessage, UserListMessage} from "@websocket-common/types";
import { IncomingMessage } from "http";

let currId = 1;


// Class for handling multiple connections
export class ConnectionManager {
    // // A set to hold the connections
    // // A set can only contain unique elements, and is most likely built as a hash-table.
    // private sockets = new Set<WebSocket>();

    // Changed to a map in order to keep information on connected user
    private connections = new Map<WebSocket, User>();

    add(socket: WebSocket, request: IncomingMessage) {        

        let hostString: string = "";
        if (request.headers.host !== undefined) {
            hostString = request.headers.host;
        }
        
        let urlParam: string = "";
        if (request.url !== undefined) {
            urlParam = request.url;
        }
        
        const fullURL = new URL(hostString + urlParam);
        const name: string = fullURL.searchParams.get("name") || "undefined";
        const user: User = {
            name,
            id: currId++
        };

        const systemNotice: SystemNotice = {
            event: "systemNotice",
            contents: `${name} has joined the chat`
        };

        // Add to map
        this.connections.set(socket, user);

        // Notify chat
        this.sendToAll(systemNotice);

        // Login message
        const loginMessage: LoginMessage = {
            user,
            event: "login"
        };
        socket.send(JSON.stringify(loginMessage));

        // Update list of users to clients
        this.sendUserListToAll();
    }

    remove(socket: WebSocket) {        
        const userName: string | undefined = this.connections.get(socket)?.name;
        this.connections.delete(socket);

        const systemNotice: SystemNotice = {
            event: "systemNotice",
            contents: `${userName || "Undefined"} has left the chat.`
        }
        
        this.sendToAll(systemNotice);
        
        // Update list of users to clients
        this.sendUserListToAll();
    }

    send(socket: WebSocket, message: WsMessage) {
        // It is not possible to send an object, so we stringify it
        const data = JSON.stringify(message);
        socket.send(data);
    }

    sendToAll(message: WsMessage) {
        for (const [socket] of this.connections) {
            if (socket.readyState === WebSocket.OPEN) {
                this.send(socket, message);
            }
        }
    }

    relayChat(fromSocket: WebSocket, chatMsg: ChatMessage) {
        
        // We add the author to the message before sending to all
        const relayMsg: ChatRelayMessage = {
            event: "chatRelay",
            contents: chatMsg.contents,
            author: this.connections.get(fromSocket)!
        }

        this.sendToAll(relayMsg);
    }

    sendUserListToAll() {
        const usersArray = Array.from(this.connections.values());
        const userListMessage: UserListMessage = {
            event: "userList",
            users: usersArray
        }
        this.sendToAll(userListMessage);
    }

}