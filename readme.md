# Websockets
This is my version of the LinkedIn learning course "WebSocket Communications with Node and Angular".

It differs from the course by not using the nx build system. The reason for this is that i prefer to not introduce yet another system in my web project. Instead the project is divided into three parts.

1. Server
2. Client
3. Common

The client and the server projects reference the common project via the tsconfig.json files.

