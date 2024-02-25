import { Connection } from "./ConnectionModel";

export class ConnectionRepository {
    connections: Array<Connection> = [];

    async getConnections() {
        return this.connections;
    }

    async saveNewConnection(conn: Connection) {
        this.connections.push(conn);
        return conn;
    }

    async getConnectionIndexById(id: number) {
        return this.connections.findIndex(item => item.id === id);
    }

    async removeConnectionById(id: number) {
        const connectionIndex = await this.getConnectionIndexById(id);
        this.connections.splice(connectionIndex, 1);
    }

    getConnectionByUserId(userId: number) {
        return this.connections.find(item => item.userId === userId);
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