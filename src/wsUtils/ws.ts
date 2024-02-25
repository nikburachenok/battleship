import WebSocket, { WebSocketServer } from 'ws';
import { handleIncomingMessage } from './wsHandler';
import { UserController } from '../utils/user/UserController';
import { RoomController } from '../utils/room/RoomController';
import { ConnectionRepository } from '../utils/connection/ConnectionRepository';
import { Connection } from '../utils/connection/ConnectionModel';
import { GameController } from '../utils/game/GameController';

export const startWebSocket = async () => {
    const ws =  new WebSocketServer({port: 3000});
    const cr = new ConnectionRepository();
    const rc: RoomController = new RoomController();
    const uc: UserController = new UserController();
    const gc: GameController = new GameController();
    ws.on('connection', async (w: WebSocket) => {
        let connections = await cr.getConnections();
        let connectionId = (await cr.saveNewConnection(new Connection(cr.getLastId(connections) + 1, w))).id;
        w.on('error', console.error);

        w.on('message', async (data: WebSocket.RawData) => {
            await handleIncomingMessage(data, w, uc, rc, cr, gc, connectionId);
        });
        w.on('close', async () => {
            await cr.removeConnectionById(connectionId);
        })
    });
}