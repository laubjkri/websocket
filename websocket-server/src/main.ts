import { ServerOptions } from "ws";
import { WsHandler } from "./services/ws-handler";

console.log("Hi im alive!");

function main() { 
    const options: ServerOptions = { port: 8080 };
    const handler = new WsHandler();
    handler.initialize(options);
}

main();
