import { ShipData } from "./ShipModel";
import { Ships } from "../constants";

export class Field {
    userId: number;
    ships: number[][] = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    startData: ShipData;

    constructor(userId: number, ships: ShipData, ) {
        this.userId = userId;
        this.startData = ships;
        ships.forEach(s => {
            for (let i = 0; i < s.length; i++) {
                this.ships[s.position.y + (s.direction ? i : 0)][s.position.x + (!s.direction ? i : 0)] = Ships[s.type];
            }
        });
    }
}