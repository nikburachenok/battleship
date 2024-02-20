import { IncomingMessage } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { handleIncomingMessage } from './wsHandler';

export const startWebSocket = async () => {
    const ws =  new WebSocketServer({port: 3000});
    ws.on('connection', function connection(w: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>) {
        w.on('error', console.error);

        w.on('message', function message(data: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>) {
            handleIncomingMessage(data, w);
        });
    });
}