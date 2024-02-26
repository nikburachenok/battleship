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
        let connections = cr.getConnections();
        let connectionId = cr.saveNewConnection(new Connection(cr.getLastId(connections) + 1, w)).id;
        w.on('error', console.error);

        w.on('message', async (data: WebSocket.RawData) => {
            await handleIncomingMessage(data, w, uc, rc, cr, gc, connectionId);
        });
        w.on('close', async () => {
            let userId = cr.getConnectionById(connectionId)?.userId;
            if (userId) {
                let gameId = gc.getGameIndexByUserId(userId);
                let roomId = rc.getRoomIndexByUserId(userId);
                if (roomId !== -1) {
                    rc.rooms.splice(roomId, 1);
                    cr.connections.forEach(item => {
                        item.webSocket.send(rc.getAvailableRooms());
                    });
                }
                if (gameId !== -1) {
                    let game = gc.getGameById(gameId);
                    let winner: any = game?.users.find((item: any) => item.index !== userId);
                    if (winner) {
                        cr.getConnectionByUserId(winner.index)?.webSocket.send(JSON.stringify({
                            type: "finish",
                            data: JSON.stringify({
                                winPlayer: winner.index
                            }),
                            id: 0
                        }));
                        await uc.updateUser(winner.index);

                        cr.getConnections().forEach(async (item) => {
                            item.webSocket.send(await uc.getWinnersInfo());
                        });
                    }
                    gc.allGames.splice(gameId, 1);
                }
            }
            cr.removeConnectionById(connectionId);
        })
    });
}