import WebSocket from 'ws';
import { MessageType } from '../utils/constants';
import { UserController } from '../utils/user/UserController';
import { User } from '../utils/user/UserModel';
import { RoomController } from '../utils/room/RoomController';
import { ConnectionRepository } from '../utils/connection/ConnectionRepository';

export const handleIncomingMessage = async (
    data: WebSocket.RawData,
    w: WebSocket,
    uc: UserController,
    rc: RoomController,
    cr: ConnectionRepository
) => {
    let message = JSON.parse(data.toString());
    if (message.type === MessageType.Registration) {
        w.send(await uc.saveUserOrLogin(new User(message.data), cr, w));
        w.send(await rc.getAvailableRooms());
        (await cr.getConnections()).forEach(async (item) => {
            item.webSocket.send(await uc.getWinnersInfo());
        });
    } else if (message.type === MessageType.NewRoom) {
        let user = await uc.getUserById(uc.currentUserId);
        (await cr.getConnections()).forEach(async (item) => {
            if (user !== undefined) {
                item.webSocket.send(await rc.createNewRoom(user));
            }
        });
        // w.send(await rc.createNewRoom(user));
    } else if (message.type === MessageType.AddUserToRoom) {
        let user = await uc.getUserById(uc.currentUserId);
        if (user !== undefined) {
            w.send(await rc.addUserToRoom(user, message.data));
        }
    } else if (message.type === MessageType.AddShips) {

    } else if (message.type === MessageType.Attack) {

    } else if (message.type === MessageType.RandomAttack) {

    }
}