import { httpServer } from "./http_server/index";
import WebSocket, { WebSocketServer } from 'ws';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const ws =  new WebSocketServer({port: 3000});

ws.on('connection', function connection(w: any) {
    w.on('error', console.error);

    w.on('message', function message(data: any) {
        let wsData = JSON.parse(data)
        console.log(wsData)

        // if (wsData.type === )
        // console.log('received: %s', data);

        // let answer = {
        //     type: "reg",
        //     data:
        //         {
        //             name: 'aaaaaaaaaaaaaaaaaa',
        //             index: 1,
        //             error: false,
        //             errorText: '',
        //         },
        //     id: 0
        // };

        // w.send(Buffer.from(JSON.stringify(answer), 'utf-8'));
    });
});
