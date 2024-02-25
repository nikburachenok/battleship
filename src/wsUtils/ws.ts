import { IncomingMessage } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { handleIncomingMessage } from './wsHandler';
import { UserController } from '../utils/user/UserController';
import { RoomController } from '../utils/room/RoomController';


export const startWebSocket = async () => {
    let uc: UserController = new UserController();
    let rc: RoomController = new RoomController();

    const ws =  new WebSocketServer({port: 3000});
    ws.on('connection',  (w: WebSocket) => {
        w.on('error', console.error);

        w.on('message', async (data: WebSocket.RawData) => {
            await handleIncomingMessage(data, w, uc, rc);
        });
    });
}