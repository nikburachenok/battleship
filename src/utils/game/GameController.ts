import { Game } from "./GameModel";
import fsPr from 'fs/promises';
import { join, dirname } from 'path';
import { User } from "../user/UserModel";

export class GameController {
    async createNewGame(currentUser: User, enemy: User) {
        let info = await fsPr.readFile(join(dirname(__dirname), 'game', 'gameDB.json'));
        let games: Array<Game> = JSON.parse(info.toString());
        let users: Array<User> = [currentUser, enemy];
        let gameId: number = this.getLastId(games) + 1;
        let game: Game = new Game(gameId, users);
        games.push(game);
        await fsPr.writeFile(join(dirname(__dirname), 'game', 'gameDB.json'), JSON.stringify(games));

        let data = {
            idGame: gameId,
            idPlayer: currentUser.id,
        };
        return JSON.stringify({
            type: "create_game",
            data: JSON.stringify(data),
            id: 0
        });
    }

    // async createNewRoom(user: User) {
    //     let info = await fsPr.readFile(join(dirname(__dirname), 'room', 'roomDB.json'));
    //     let rooms: Array<Room> = JSON.parse(info.toString());
    //     let room: Room = new Room();
    //     room.id = this.getLastId(rooms) + 1;
    //     room.users.push(user);
    //     rooms.push(room);
    //     await fsPr.writeFile(join(dirname(__dirname), 'room', 'roomDB.json'), JSON.stringify(rooms));

    //     let data = rooms.map(item => {
    //         return {
    //             roomId: item.id,
    //             roomUsers: item.users.map(user => {
    //                 return { name: user.name, index: user.id }
    //             })
    //         }
    //     });
    //     return JSON.stringify({
    //         type: "update_room",
    //         data: JSON.stringify(data),
    //         id: 0
    //     });
    // }

    // async addUserToRoom(user: User, messageData: string) {
    //     let info = await fsPr.readFile(join(dirname(__dirname), 'room', 'roomDB.json'));
    //     let rooms: Array<Room> = JSON.parse(info.toString());
    //     let room = rooms.find(item => item.id === JSON.parse(messageData).indexRoom);
    //     if (room !== undefined) {
    //         room.users.push(user);
    //         await fsPr.writeFile(join(dirname(__dirname), 'room', 'roomDB.json'), JSON.stringify(rooms));
    //     }

    //     let data = rooms.map(item => {
    //         return {
    //             roomId: item.id,
    //             roomUsers: item.users.map(user => {
    //                 return { name: user.name, index: user.id }
    //             })
    //         }
    //     });
    //     return JSON.stringify({
    //         type: "update_room",
    //         data: JSON.stringify(data),
    //         id: 0
    //     });
    // }

    // async getRoomById(id: number) {
    //     let info = await fsPr.readFile(join(dirname(__dirname), 'room', 'roomDB.json'));
    //     let rooms: Array<Room> = JSON.parse(info.toString());
    //     let room = rooms.find(item =>  item.id === id);
    //     return room;
    // };

    getLastId(arr: Array<Game>) {
        let max = -1;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id > max) {
                max = arr[i].id;
            }
        }
        return max;
    }
}