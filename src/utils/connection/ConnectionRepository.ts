import { Connection } from "./ConnectionModel";

export class ConnectionRepository {
    connections: Array<Connection> = [];

    async getConnections() {
        return this.connections;
    }

    async saveNewConnection(conn: Connection) {
        this.connections.push(conn)
    }

    async getConnectionIndexByUserId(userId: number) {
        return this.connections.findIndex(item => item.userId === userId);
    }

    async removeConnectionByUserId(userId: number) {
        const connectionIndex = await this.getConnectionIndexByUserId(userId);
        this.connections.splice(connectionIndex, 1);
    }

    getLastId(arr: Array<Connection>) {
        let max = -1;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id > max) {
                max = arr[i].id;
            }
        }
        return max;
    }
}