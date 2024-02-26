import { Room } from "./RoomModel";
import { User } from "../user/UserModel";

export class RoomController {
    rooms: Array<Room> = [];

    getAvailableRooms() {
        let data = this.rooms.map(item => {
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

    createNewRoom(user: User) {
        let room: Room = new Room();
        room.id = this.getLastId(this.rooms) + 1;
        room.users.push(user);
        this.rooms.push(room);

        let data = this.rooms.map(item => {
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

    addUserToRoom(user: User, messageData: string) {
        let room = this.rooms.find(item => item.id === JSON.parse(messageData).indexRoom);
        if (room !== undefined) {
            if (room.users[0].id === user.id) {
                return;
            }
            if (room.users.length === 2) {
                return;
            }
            let anotherRoomIndex = this.getRoomIndexByUserId(user.id);
            if (anotherRoomIndex >= 0) {
                this.rooms.splice(anotherRoomIndex, 1);
            }
            room.users.push(user);
        }

        return this.rooms.map(item => {
            return {
                roomId: item.id,
                roomUsers: item.users.map(user => {
                    return { name: user.name, index: user.id }
                })
            }
        });
    }

    getRoomIndexByUserId(userId: number) {
        let room = this.rooms.findIndex(item => item.users.find(user => user.id === userId));
        return room;
    }

    getRoomById(id: number) {
        let room = this.rooms.find(item =>  item.id === id);
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