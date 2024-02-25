import WebSocket, { WebSocketServer } from 'ws';
import { handleIncomingMessage } from './wsHandler';
import { UserController } from '../utils/user/UserController';
import { RoomController } from '../utils/room/RoomController';
import { ConnectionRepository } from '../utils/connection/ConnectionRepository';

export const startWebSocket = async () => {
    const ws =  new WebSocketServer({port: 3000});
    const cr = new ConnectionRepository();
    const rc: RoomController = new RoomController();
    ws.on('connection', async (w: WebSocket) => {
        const uc: UserController = new UserController();
        w.on('error', console.error);

        w.on('message', async (data: WebSocket.RawData) => {
            await handleIncomingMessage(data, w, uc, rc, cr);
        });
        w.on('close', async () => {
            await cr.removeConnectionByUserId(uc.currentUserId);
        })
    });
}