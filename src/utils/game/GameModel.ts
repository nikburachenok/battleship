import { User } from "../user/UserModel";

export class Game {
    id: number;
    initiator: User;
    anotherUser: User;

    constructor(id: number, initiator: User, anotherUser: User) {
        this.id = id;
        this.initiator = initiator;
        this.anotherUser = anotherUser;
    }
}