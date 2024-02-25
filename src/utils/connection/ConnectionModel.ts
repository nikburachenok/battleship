import { User } from "../user/UserModel";
import WebSocket from 'ws';

export class Connection {
    id: number;
    userId: number = 0;
    webSocket: WebSocket;

    constructor(id: number, userId: number, webSocket: WebSocket) {
        this.id = id;
        this.userId = userId;
        this.webSocket = webSocket;
    }
}