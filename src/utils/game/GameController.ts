import { User } from "../user/UserModel";
import { Field } from "../field/FieldModel";
import { Game } from "./GameModel";

export class GameController {
    allGames: Array<Game> = [];
    createNewGame(user: any, currentGameId: number | undefined) {
        let game: Game | undefined;
        if (typeof currentGameId === 'number') {
            game = this.getGameById(currentGameId);
            game?.users.push(user);
        } else {
            game = new Game(this.getLastId(this.allGames) + 1, [user]);
            this.allGames.push(game);
        }

        let data = {
            idGame: game?.id,
            idPlayer: user.index,
        };
        return {
            type: "create_game",
            data: JSON.stringify(data),
            id: 0
        };
    }

    createNewGameForRandom(user: User) {
        let game: Game = new Game(this.getLastId(this.allGames) + 1, [user]);
        this.allGames.push(game);

        let data = {
            idGame: game?.id,
            idPlayer: user.id,
        };
        return {
            type: "create_game",
            data: JSON.stringify(data),
            id: 0
        };
    }

    getGameById(id: number) {
        let game = this.allGames.find(item => item.id === id);
        return game;
    };

    getGameIndexByUserId(userId: number) {
        let game = this.allGames.findIndex(item => item.users.find((user: any) => user.index === userId));
        return game;
    }

    getLastId(arr: Array<Game>) {
        let max = -1;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id > max) {
                max = arr[i].id;
            }
        }
        return max;
    }

    addField(field: Field, gameId: number) {
        let game = this.getGameById(gameId);
        game?.fields.push(field);
        return game;
    }
}