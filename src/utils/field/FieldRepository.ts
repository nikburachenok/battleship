import { Field } from "./FieldModel";
import { ShipData } from "./ShipModel";
import { Ships } from "../constants";

export class FieldRepository {

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
    public needUpdateKilled: any[] | null = null;

    constructor(ships: ShipData, ) {
        this.startData = ships;
        ships.forEach(s => {
            for (let i = 0; i < s.length; i++) {
                this.ships[s.position.y + (s.direction ? i : 0)][s.position.x + (!s.direction ? i : 0)] = Ships[s.type];
            }
        });
    }

    // private checkNearCeils(l: number, x: number, y: number) {
    //     for (let i = x, j = x; i < x + l - 1 && j > x - l + 1; i++, j--) {
    //         if ((this.ships[y][i] && this.ships[y][i] === l) || (this.ships[y][j] && this.ships[y][j] === l)) return true;
    //     }
    //     for (let i = y, j = y; i < y + l - 1 && j > y - l + 1; i++, j--) {
    //         if ((this.ships[i][x] && this.ships[i][x] === l) || (this.ships[j][x] && this.ships[j][x] === l)) return true;
    //     }
    //     return false;
    // }
    // private checkIsKilled(l: number, x: number, y: number) {
    //     let isKilled = l - 1;
    //     const needToUpdate = [];
    //     for (let i = x, j = x; i < x + l && j >= x - l + 1; i++, j--) {
    //         if (this.ships[y] && this.ships[y][i] && this.ships[y][i] === (l * -1)) {
    //             isKilled -= 1;
    //             needToUpdate.push({ 'x': y, 'y': i, status: Attacks[2] })
    //         };
    //         if (this.ships[y] && this.ships[y][j] && this.ships[y][j] === (l * -1)) {
    //             isKilled -= 1;
    //             needToUpdate.push({ 'x': y, 'y': j, status: Attacks[2] })
    //         };
    //     }
    //     if (isKilled !== 0) {
    //         for (let i = y, j = y; i < y + l && j >= y - l + 1; i++, j--) {
    //             if (this.ships[i] && this.ships[i][x] && this.ships[i][x] === (l * -1)) {
    //                 isKilled -= 1;
    //                 needToUpdate.push({ 'x': i, 'y': x, status: Attacks[2] })
    //             }
    //             if (this.ships[j] && this.ships[j][x] && this.ships[j][x] === (l * -1)) {
    //                 isKilled -= 1;
    //                 needToUpdate.push({ 'x': j, 'y': x, status: Attacks[2] })
    //             };
    //         }
    //     }

    //     return { value: isKilled === 0, needToUpdate };
    // }
    // private getEmptyAfterKilled(values: { x: number, y: number }[]): { x: number, y: number, status: keyof typeof Attacks }[] {
    //     const resToUpdate: { x: number, y: number, status: keyof typeof Attacks }[] = [];
    //     values.forEach(ceil => {
    //         const { x, y } = ceil;
    //         for (let i = -1; i <= 1; i++) {
    //             for (let j = -1; j <= 1; j++) {
    //                 if (!(i === 0 && j === 0)) {
    //                     if (this.ships[y + j] && this.ships[y + j][x + i] === 0) {
    //                         this.ships[y + j][x + i] = -5;
    //                         resToUpdate.push({ 'x': y + j, 'y': x + i, status: Attacks[0] as keyof typeof Attacks })
    //                     }
    //                 }

    //             }
    //         }
    //     })
    //     return resToUpdate
    // }
    // public getStartData(): ShipData {
    //     return this.startData
    // }
    // public checkAttack(x: number, y: number): string {
    //     const ceil = this.ships[y][x];

    //     if (ceil === 0) {
    //         this.ships[y][x] = -5;
    //         return Attacks[0]
    //     }
    //     const isKilled = this.checkIsKilled(ceil, x, y);

    //     if (ceil > 0 && ceil < 5 && isKilled.value) {
    //         this.ships[y][x] = ceil * -1;

    //         // if () {

    //         console.log(...isKilled.needToUpdate.map(i => { return { x: i.x, y: i.y } }));

    //         const emptyNeedToUpdate = this.getEmptyAfterKilled([{ x, y }, ...isKilled.needToUpdate.map(i => { return { x: i.y, y: i.x } })]);
    //         this.needUpdateKilled = [...isKilled.needToUpdate, ...emptyNeedToUpdate];
    //         return Attacks[2]
    //     };
    //     if (ceil > 0 && ceil < 5 && this.checkNearCeils(ceil, x, y)) {
    //         this.ships[y][x] = ceil * -1;
    //         return Attacks[1]
    //     };
    //     if (ceil > 0 && ceil < 5 && !this.checkNearCeils(ceil, x, y)) {
    //         this.ships[y][x] = ceil * -1;
    //         return Attacks[2]
    //     };
    //     if (ceil < 0) {
    //         return Attacks[3]
    //     }
    //     return Attacks[0]
    // }
}