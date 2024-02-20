import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { MessageType } from '../utils/constants';

export const handleIncomingMessage = async (
    data: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>,
    w: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>
) => {
    console.log(data.toString());
    let message = JSON.parse(data.toString());
    if (message.type === MessageType.Registration) {

    } else if (message.type === MessageType.NewRoom) {

    } else if (message.type === MessageType.AddUserToRoom) {

    } else if (message.type === MessageType.AddShips) {

    } else if (message.type === MessageType.Attack) {

    } else if (message.type === MessageType.RandomAttack) {

    }
}