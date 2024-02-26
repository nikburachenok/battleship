import { User } from "./UserModel";
import fsPr from 'fs/promises';
import { join, dirname } from 'path';
import { ConnectionRepository } from "../connection/ConnectionRepository";

export class UserController {
    async saveUserOrLogin(user: User, cr: ConnectionRepository, connectionId: number) {
        let userId: number;
        let resultMessage: string;
        let info = await fsPr.readFile(join(dirname(__dirname), 'user', 'userDB.json'));
        let users: Array<User> = JSON.parse(info.toString());
        let dbUser = await this.getUserByName(user.name);
        if (dbUser) {
            userId = dbUser.id;
            let data = {
                name: user.name,
                index: user.id,
                error: false,
                errorText: ''
            };
            if (user.password !== dbUser.password) {
                data.error = true;
                data.errorText = 'Wrong or duplicate user name or wrong password';
            } else {
                if (cr.getConnectionByUserId(dbUser.id)) {
                    data.error = true;
                    data.errorText = 'This user has already entered the game. Please, use another credentials';
                }
                cr.connections[cr.getConnectionIndexById(connectionId)].userId = userId;
            }

            resultMessage = JSON.stringify({
                type: "reg",
                data: JSON.stringify(data),
                id: 0
            });
        } else {
            user.id = this.getLastId(users) + 1;
            userId = user.id;
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
            cr.connections[cr.getConnectionIndexById(connectionId)].userId = userId;
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
        let data = users.sort(this.sort).map(item => {
            return { name: item.name, wins: item.wins };
        });
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

    async updateUser(userId: number) {
        let info = await fsPr.readFile(join(dirname(__dirname), 'user', 'userDB.json'));
        let users: Array<User> = JSON.parse(info.toString());
        let user = users.find(item =>  item.id === userId);
        if (user) {
            ++user.wins;
            await fsPr.writeFile(join(dirname(__dirname), 'user', 'userDB.json'), JSON.stringify(users));
        }
    }

    getLastId(arr: Array<User>) {
        let max = -1;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id > max) {
                max = arr[i].id;
            }
        }
        return max;
    }

    sort(a: User, b: User) {
        return b.wins - a.wins;
    }
}