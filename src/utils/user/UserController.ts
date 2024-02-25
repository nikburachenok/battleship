import { User } from "./UserModel";
import fsPr from 'fs/promises';
import { join, dirname } from 'path';
import { ConnectionRepository } from "../connection/ConnectionRepository";
import { Connection } from "../connection/ConnectionModel";
import WebSocket from 'ws';

export class UserController {
    currentUserId: number = 1000;
    async saveUserOrLogin(user: User, cr: ConnectionRepository, w: WebSocket) {
        let resultMessage: string;
        let info = await fsPr.readFile(join(dirname(__dirname), 'user', 'userDB.json'));
        let users: Array<User> = JSON.parse(info.toString());
        let dbUser = await this.getUserByName(user.name);
        if (dbUser) {
            this.currentUserId = dbUser.id;
            let data = {
                name: user.name,
                index: user.id,
                error: false,
                errorText: ''
            };
            if (user.password !== dbUser.password) {
                data.error = true;
                data.errorText = 'AAAAAAAAAAAAAAAAA';
            } else {
                cr.saveNewConnection(new Connection(cr.getLastId(await cr.getConnections()) + 1, this.currentUserId, w));
            }

            resultMessage = JSON.stringify({
                type: "reg",
                data: JSON.stringify(data),
                id: 0
            });
        } else {
            user.id = this.getLastId(users) + 1;
            this.currentUserId = user.id;
            user.wins = 0;
            users.push(user);
            resultMessage = JSON.stringify({
                type: "reg",
                data: JSON.stringify({
                    name: user.name,
                    index: user.id,
                    error: false,
                    errorText: ''
                }),
                id: 0
            });
            await fsPr.writeFile(join(dirname(__dirname), 'user', 'userDB.json'), JSON.stringify(users));
            cr.saveNewConnection(new Connection(cr.getLastId(await cr.getConnections()) + 1, this.currentUserId, w));
        }
        return resultMessage;
    }

    async getUserById(id: number) {
        let info = await fsPr.readFile(join(dirname(__dirname), 'user', 'userDB.json'));
        let users: Array<User> = JSON.parse(info.toString());
        let user = users.find(item =>  item.id === id);
        return user;
    };

    async getWinnersInfo() {
        let info = await fsPr.readFile(join(dirname(__dirname), 'user', 'userDB.json'));
        let users: Array<User> = JSON.parse(info.toString());
        let data = users.map(item => {
            return { name: item.name, wins: item.wins };
        })
        return JSON.stringify({
            type: "update_winners",
            data: JSON.stringify(data),
            id: 0
        });
    }

    async getUserByName(name: string) {
        let info = await fsPr.readFile(join(dirname(__dirname), 'user', 'userDB.json'));
        let users: Array<User> = JSON.parse(info.toString());
        let user = users.find(item =>  item.name === name);
        return user;
    };

    getLastId(arr: Array<User>) {
        let max = -1;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id > max) {
                max = arr[i].id;
            }
        }
        return max;
    }
}