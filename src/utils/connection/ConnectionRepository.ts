import { Connection } from "./ConnectionModel";

export class ConnectionRepository {
    connections: Array<Connection> = [];

    getConnections() {
        return this.connections;
    }

    saveNewConnection(conn: Connection) {
        this.connections.push(conn);
        return conn;
    }

    getConnectionIndexById(id: number) {
        return this.connections.findIndex(item => item.id === id);
    }

    getConnectionById(id: number) {
        return this.connections.find(item => item.id === id);
    }

    removeConnectionById(id: number) {
        const connectionIndex = this.getConnectionIndexById(id);
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