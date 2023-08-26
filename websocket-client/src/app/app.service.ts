import { Injectable } from "@angular/core";
import { User, WsMessage, ChatRelayMessage, ChatMessage, SystemNotice, UserListMessage } from "@websocket-common/types";
import { BehaviorSubject, Subject } from "rxjs";
import { WebSocketSubject, webSocket } from "rxjs/webSocket";


// This service is interacting with the back-end.

@Injectable()    
export class AppService {
    // the $ naming convention is used to indicate an event emitting variable
    // The subject classes are coming from the rxjs library.

    user$ = new BehaviorSubject<User | undefined>(undefined);  // The BehaviorSubject emits the last event on new subscribers
    socket?: WebSocketSubject<WsMessage>;
    chatMessage$ = new Subject<ChatRelayMessage>();
    systemNotice$ = new Subject<SystemNotice>();
    users$ = new Subject<UserListMessage>();

    connect(name: string) {
        this.socket = webSocket(`ws://localhost:8080?name=${name}`);
        this.socket.subscribe(message => this.onMessageFromServer(message));        
    }

    send(contents: string) {
        const chatMsg: ChatMessage = {
            event: "chat",
            contents
        }

        this.socket?.next(chatMsg);
    }

    /** This function passes events from the websocket subject to the individual event emitting subjects that the component can subscribe to.  */
    onMessageFromServer(message: WsMessage) {
        
        console.log("Message from server:", message);
        switch (message.event) {
            case "login": {
                this.user$.next(message.user); // next is used to push something into stream
                break;
            }
                
            case "chatRelay": {
                this.chatMessage$.next(message);
                console.log("Author:" + message.author.name + " Id: " + message.author.id);                
                break;
            }
                
            case "systemNotice": {
                this.systemNotice$.next(message);
                break;
            }
            
            case "userList": {
                this.users$.next(message);
                break;
            }
                
            default:
                break;
        }
    }
}
