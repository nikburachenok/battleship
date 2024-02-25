import WebSocket from 'ws';
import { MessageType } from '../utils/constants';
import { UserController } from '../utils/user/UserController';
import { User } from '../utils/user/UserModel';
import { RoomController } from '../utils/room/RoomController';
import { ConnectionRepository } from '../utils/connection/ConnectionRepository';
import { GameController } from '../utils/game/GameController';
import { Field } from '../utils/field/FieldModel';
import { ShipData } from '../utils/field/ShipModel';
import { Game } from '../utils/game/GameModel';

export const handleIncomingMessage = async (
    data: WebSocket.RawData,
    w: WebSocket,
    uc: UserController,
    rc: RoomController,
    cr: ConnectionRepository,
    gc: GameController,
    connectionId: number
) => {
    let message = JSON.parse(data.toString());
    if (message.type === MessageType.Registration) {
        w.send(await uc.saveUserOrLogin(new User(message.data), cr, connectionId));
        w.send(await rc.getAvailableRooms());
        (await cr.getConnections()).forEach(async (item) => {
            item.webSocket.send(await uc.getWinnersInfo());
        });
    } else if (message.type === MessageType.NewRoom) {
        let userId = cr.connections[await cr.getConnectionIndexById(connectionId)].userId;
        let user = await uc.getUserById(userId);
        (await cr.getConnections()).forEach(async (item) => {
            if (user !== undefined) {
                item.webSocket.send(await rc.createNewRoom(user));
            }
        });
    } else if (message.type === MessageType.AddUserToRoom) {
        let userId = cr.connections[await cr.getConnectionIndexById(connectionId)].userId;
        let user = await uc.getUserById(userId);
        let roomInfo: any;
        if (user) {
            roomInfo = await rc.addUserToRoom(user, message.data)
        }
        let gameId: number;
        cr.connections.forEach(async (item) => {
            item.webSocket.send(JSON.stringify({
                type: "update_room",
                data: JSON.stringify(roomInfo),
                id: 0
            }));
            let roomUsers: any = roomInfo[JSON.parse(message.data).indexRoom].roomUsers;
            roomUsers.forEach((user: any) => {
                if (item.userId === user.index) {
                    let createGameMessage = gc.createNewGame(user, gameId);
                    gameId = JSON.parse(createGameMessage.data).idGame;
                    item.webSocket.send(JSON.stringify(createGameMessage));
                }
            })
        });
    } else if (message.type === MessageType.AddShips) {
        let data = JSON.parse(message.data);
        let gameId = data.gameId;
        let field = new Field(data.indexPlayer, data.ships as ShipData);
        let game: Game | undefined = gc.addField(field, gameId);
        if (game && game.fields.length === 2) {
            game.fields.forEach(item => {
                cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                    type: "start_game",
                    data: JSON.stringify({
                        ships: item.startData,
                        currentPlayerIndex: item.userId
                    }),
                    id: 0
                }))
            })
        }
    } else if (message.type === MessageType.Attack) {

    } else if (message.type === MessageType.RandomAttack) {

    }
}