import { User } from "../user/UserModel";

export class Game {
    id: number;
    users: Array<User>

    constructor(id: number, users: Array<User>) {
        this.id = id;
        this.users = users;
    }
}