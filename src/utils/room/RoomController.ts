import { Room } from "./RoomModel";
import fsPr from 'fs/promises';
import { join, dirname } from 'path';
import { User } from "../user/UserModel";

export class RoomController {
    async getAvailableRooms() {
        let info = await fsPr.readFile(join(dirname(__dirname), 'room', 'roomDB.json'));
        let rooms: Array<Room> = JSON.parse(info.toString());
        let data = rooms.map(item => {
            return {
                roomId: item.id,
                roomUsers: item.users.map(user => {
                    return { name: user.name, index: user.id }
                })
            }
        });
        return JSON.stringify({
            type: "update_room",
            data: JSON.stringify(data),
            id: 0
        });
    }

    async createNewRoom(user: User) {
        let info = await fsPr.readFile(join(dirname(__dirname), 'room', 'roomDB.json'));
        let rooms: Array<Room> = JSON.parse(info.toString());
        let room: Room = new Room();
        room.id = this.getLastId(rooms) + 1;
        room.users.push(user);
        rooms.push(room);
        await fsPr.writeFile(join(dirname(__dirname), 'room', 'roomDB.json'), JSON.stringify(rooms));

        let data = rooms.map(item => {
            return {
                roomId: item.id,
                roomUsers: item.users.map(user => {
                    return { name: user.name, index: user.id }
                })
            }
        });
        return JSON.stringify({
            type: "update_room",
            data: JSON.stringify(data),
            id: 0
        });
    }

    async addUserToRoom(user: User, messageData: string) {
        let info = await fsPr.readFile(join(dirname(__dirname), 'room', 'roomDB.json'));
        let rooms: Array<Room> = JSON.parse(info.toString());
        let room = rooms.find(item => item.id === JSON.parse(messageData).indexRoom);
        if (room !== undefined) {
            room.users.push(user);
            await fsPr.writeFile(join(dirname(__dirname), 'room', 'roomDB.json'), JSON.stringify(rooms));
        }

        return rooms.map(item => {
            return {
                roomId: item.id,
                roomUsers: item.users.map(user => {
                    return { name: user.name, index: user.id }
                })
            }
        });

        // let data = rooms.map(item => {
        //     return {
        //         roomId: item.id,
        //         roomUsers: item.users.map(user => {
        //             return { name: user.name, index: user.id }
        //         })
        //     }
        // });
        // return {
        //     type: "update_room",
        //     data: JSON.stringify(data),
        //     id: 0
        // };
    }

    async getRoomById(id: number) {
        let info = await fsPr.readFile(join(dirname(__dirname), 'room', 'roomDB.json'));
        let rooms: Array<Room> = JSON.parse(info.toString());
        let room = rooms.find(item =>  item.id === id);
        return room;
    };

    getLastId(arr: Array<Room>) {
        let max = -1;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id > max) {
                max = arr[i].id;
            }
        }
        return max;
    }
}