export class User {
    id: number;
    name: string;
    password: string;
    wins: number;

    constructor(userData: string) {
        let {id, name, password, wins} = JSON.parse(userData);
        this.id = id;
        this.name = name;
        this.password = password;
        this.wins = wins;
    }
}