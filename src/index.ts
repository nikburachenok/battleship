import { httpServer } from "./http_server/index";
import { startWebSocket } from "./wsUtils/ws";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
startWebSocket();