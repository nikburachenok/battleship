import { Field } from "../field/FieldModel";
import { User } from "../user/UserModel";

export class Game {
    id: number;
    users: Array<User>;
    fields: Array<Field> = [];
    turn: number = -1;

    constructor(id: number, users: Array<User>) {
        this.id = id;
        this.users = users;
    }
}