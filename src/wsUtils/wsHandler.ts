import WebSocket from 'ws';
import { MessageType } from '../utils/constants';
import { UserController } from '../utils/user/UserController';
import { User } from '../utils/user/UserModel';
import { RoomController } from '../utils/room/RoomController';
import { ConnectionRepository } from '../utils/connection/ConnectionRepository';
import { GameController } from '../utils/game/GameController';
import { Field } from '../utils/field/FieldModel';
import { ShipData } from '../utils/field/ShipModel';
import { Game } from '../utils/game/GameModel';

export const handleIncomingMessage = async (
    data: WebSocket.RawData,
    w: WebSocket,
    uc: UserController,
    rc: RoomController,
    cr: ConnectionRepository,
    gc: GameController,
    connectionId: number
) => {
    let message = JSON.parse(data.toString());
    if (message.type === MessageType.Registration) {
        w.send(await uc.saveUserOrLogin(new User(message.data), cr, connectionId));
        w.send(rc.getAvailableRooms());
        cr.getConnections().forEach(async (item) => {
            item.webSocket.send(await uc.getWinnersInfo());
        });
    } else if (message.type === MessageType.NewRoom) {
        let userId = cr.connections[cr.getConnectionIndexById(connectionId)].userId;
        let user = await uc.getUserById(userId);
        let createRoomInfo: string;
        if (user !== undefined) {
            createRoomInfo = rc.createNewRoom(user);
        }
        cr.getConnections().forEach(async (item) => {
            if (user !== undefined) {
                if (createRoomInfo) {
                    item.webSocket.send(createRoomInfo);
                }
            }
        });
    } else if (message.type === MessageType.AddUserToRoom) {
        let userId = cr.connections[cr.getConnectionIndexById(connectionId)].userId;
        let user = await uc.getUserById(userId);
        let roomInfo: any;
        if (user) {
            roomInfo = rc.addUserToRoom(user, message.data);
            if (!roomInfo) {
                return;
            }
        }
        let gameId: number;
        cr.connections.forEach(item => {
            item.webSocket.send(JSON.stringify({
                type: "update_room",
                data: JSON.stringify(roomInfo),
                id: 0
            }));
            let roomUsers: any = roomInfo.find((item: any) => item.roomId === JSON.parse(message.data).indexRoom).roomUsers;
            roomUsers.forEach((user: any) => {
                if (item.userId === user.index) {
                    let createGameMessage = gc.createNewGame(user, gameId);
                    gameId = JSON.parse(createGameMessage.data).idGame;
                    item.webSocket.send(JSON.stringify(createGameMessage));
                }
            })
        });
    } else if (message.type === MessageType.AddShips) {
        let data = JSON.parse(message.data);
        let gameId = data.gameId;
        let field = new Field(data.indexPlayer, data.ships as ShipData);
        let game: Game | undefined = gc.addField(field, gameId);
        if (game && game.users.length === 2 && game.fields.length === 2) {
            game.turn = game?.fields[0].userId;
            game.fields.forEach(item => {
                cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                    type: "start_game",
                    data: JSON.stringify({
                        ships: item.initData,
                        currentPlayerIndex: item.userId
                    }),
                    id: 0
                }))
            })

            game.fields.forEach(item => {
                cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                    type: "turn",
                    data: JSON.stringify({
                        currentPlayer: game?.fields[0].userId
                    }),
                    id: 0
                }))
            })
        }
        if (game && game.users.length === 1 && game.fields.length === 1) {
            let botField = new Field(-1, undefined);
            game.fields.push(botField);
            game.turn = game?.fields[0].userId;
            game.fields.forEach(item => {
                if (item.userId >= 0) {
                    cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                        type: "start_game",
                        data: JSON.stringify({
                            ships: item.initData,
                            currentPlayerIndex: item.userId
                        }),
                        id: 0
                    }));
                    cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                        type: "turn",
                        data: JSON.stringify({
                            currentPlayer: game?.fields[0].userId
                        }),
                        id: 0
                    }));
                }
            })
        }
    } else if (message.type === MessageType.Attack) {
        let data = JSON.parse(message.data);
        let gameId = data.gameId;
        let game = gc.getGameById(gameId);
        if (game?.turn !== data.indexPlayer) {
            return;
        }
        let enemyField: Field | undefined = game?.fields.find(item => item.userId !== data.indexPlayer);
        let attackResult = enemyField?.checkShot(data.x, data.y);

        let isAlive = enemyField?.isAlive();

        if (attackResult === 'miss') {
            if (game) {
                if (enemyField) {
                    game.turn = enemyField?.userId;
                }
                game.fields.forEach(item => {
                    cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                        type: "attack",
                        data: JSON.stringify({
                            position: {
                                x: data.x,
                                y: data.y
                            },
                            currentPlayer: data.indexPlayer,
                            status: attackResult
                        }),
                        id: 0
                    }));
                    cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                        type: "turn",
                        data: JSON.stringify({
                            currentPlayer: enemyField?.userId
                        }),
                        id: 0
                    }));
                });
                await sleep(1500);
                await randomBotAttack(enemyField, game, data);
            }
        } else if (attackResult === 'wrongAttack') {
            return;
        } else if (attackResult === 'killed') {
            if (game) {
                game.turn = data.indexPlayer;
                game.fields.forEach(async (item) => {
                    cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                        type: "attack",
                        data: JSON.stringify({
                            position: {
                                x: data.x,
                                y: data.y
                            },
                            currentPlayer: data.indexPlayer,
                            status: attackResult
                        }),
                        id: 0
                    }));
                    enemyField?.needUpdateKilled?.forEach(cell => {
                        cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                            type: "attack",
                            data: JSON.stringify({
                                position: {
                                    x: cell.y,
                                    y: cell.x
                                },
                                currentPlayer: data.indexPlayer,
                                status: cell.status
                            }),
                            id: 0
                        }));
                    });

                    if (isAlive) {
                        cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                            type: "turn",
                            data: JSON.stringify({
                                currentPlayer: data.indexPlayer
                            }),
                            id: 0
                        }));
                    } else {
                        cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                            type: "finish",
                            data: JSON.stringify({
                                winPlayer: data.indexPlayer
                            }),
                            id: 0
                        }));
                        await uc.updateUser(data.indexPlayer);

                        let gameId = gc.getGameIndexByUserId(data.indexPlayer);
                        let roomId = rc.getRoomIndexByUserId(data.indexPlayer);
                        if (roomId !== -1) {
                            rc.rooms.splice(roomId, 1);
                            cr.connections.forEach(item => {
                                item.webSocket.send(rc.getAvailableRooms());
                            });
                        }
                        if (gameId !== -1) {
                            gc.allGames.splice(gameId, 1);
                        }

                        cr.getConnections().forEach(async (item) => {
                            item.webSocket.send(await uc.getWinnersInfo());
                        });
                    }
                });
            }
        } else {
            if (game) {
                game.turn = data.indexPlayer;
                game.fields.forEach(item => {
                    cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                        type: "attack",
                        data: JSON.stringify({
                            position: {
                                x: data.x,
                                y: data.y
                            },
                            currentPlayer: data.indexPlayer,
                            status: attackResult
                        }),
                        id: 0
                    }));
                    cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                        type: "turn",
                        data: JSON.stringify({
                            currentPlayer: data.indexPlayer
                        }),
                        id: 0
                    }));
                });
            }
        }
    } else if (message.type === MessageType.RandomAttack) {
        let data = JSON.parse(message.data);
        let gameId = data.gameId;
        let game = gc.getGameById(gameId);
        if (game?.turn !== data.indexPlayer) {
            return;
        }
        let enemyField: Field | undefined = game?.fields.find(item => item.userId !== data.indexPlayer);
        let randomAttackResult = enemyField?.randomAttack();
        if (randomAttackResult?.status === 'miss') {
            if (game) {
                if (enemyField) {
                    game.turn = enemyField?.userId;
                }
                game.fields.forEach(item => {
                    cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                        type: "attack",
                        data: JSON.stringify({
                            position: {
                                x: randomAttackResult?.x,
                                y: randomAttackResult?.y
                            },
                            currentPlayer: data.indexPlayer,
                            status: randomAttackResult?.status
                        }),
                        id: 0
                    }));
                    cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                        type: "turn",
                        data: JSON.stringify({
                            currentPlayer: enemyField?.userId
                        }),
                        id: 0
                    }));
                });
                await sleep(1500);
                await randomBotAttack(enemyField, game, data);
            }
        } else if (randomAttackResult?.status === 'killed') {
            if (game) {
                game.turn = data.indexPlayer;
                game.fields.forEach(item => {
                    cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                        type: "attack",
                        data: JSON.stringify({
                            position: {
                                x: randomAttackResult?.x,
                                y: randomAttackResult?.y
                            },
                            currentPlayer: data.indexPlayer,
                            status: randomAttackResult?.status
                        }),
                        id: 0
                    }));
                    enemyField?.needUpdateKilled?.forEach(cell => {
                        cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                            type: "attack",
                            data: JSON.stringify({
                                position: {
                                    x: cell.y,
                                    y: cell.x
                                },
                                currentPlayer: data.indexPlayer,
                                status: cell.status
                            }),
                            id: 0
                        }));
                    })
                    cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                        type: "turn",
                        data: JSON.stringify({
                            currentPlayer: data.indexPlayer
                        }),
                        id: 0
                    }));
                });
            }
        } else {
            if (game) {
                game.turn = data.indexPlayer;
                game.fields.forEach(item => {
                    cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                        type: "attack",
                        data: JSON.stringify({
                            position: {
                                x: randomAttackResult?.x,
                                y: randomAttackResult?.y
                            },
                            currentPlayer: data.indexPlayer,
                            status: randomAttackResult?.status
                        }),
                        id: 0
                    }));
                    cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                        type: "turn",
                        data: JSON.stringify({
                            currentPlayer: data.indexPlayer
                        }),
                        id: 0
                    }));
                });
            }
        }
    } else if (message.type === MessageType.SinglePlay) {
        let userId = cr.connections[cr.getConnectionIndexById(connectionId)].userId;
        if (userId >= 0) {
            let user = await uc.getUserById(userId);
            if (user) {
                let createGameMessage = gc.createNewGameForRandom(user);
                cr.connections[cr.getConnectionIndexById(connectionId)].webSocket.send(JSON.stringify(createGameMessage));
            }
        }
    }

    async function randomBotAttack (enemyField: Field | undefined, game: Game, data: any) {
        if (enemyField?.userId === -1) {
            let userField: Field | undefined = game?.fields.find(item => item.userId === data.indexPlayer);
            let randomAttackResult = userField?.randomAttack();
            let isAlive = userField?.isAlive();
            if (randomAttackResult?.status === 'miss') {
                if (game) {
                    game.turn = data.indexPlayer;
                    game.fields.forEach(item => {
                        cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                            type: "attack",
                            data: JSON.stringify({
                                position: {
                                    x: randomAttackResult?.x,
                                    y: randomAttackResult?.y
                                },
                                currentPlayer: -1,
                                status: randomAttackResult?.status
                            }),
                            id: 0
                        }));
                        cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                            type: "turn",
                            data: JSON.stringify({
                                currentPlayer: data.indexPlayer
                            }),
                            id: 0
                        }));
                    });
                }
            } else if (randomAttackResult?.status === 'killed') {
                if (game) {
                    game.turn = -1;
                    cr.getConnectionByUserId(game.fields[0].userId)?.webSocket.send(JSON.stringify({
                        type: "attack",
                        data: JSON.stringify({
                            position: {
                                x: randomAttackResult?.x,
                                y: randomAttackResult?.y
                            },
                            currentPlayer: -1,
                            status: randomAttackResult?.status
                        }),
                        id: 0
                    }));
                    userField?.needUpdateKilled?.forEach(cell => {
                        cr.getConnectionByUserId(game.fields[0].userId)?.webSocket.send(JSON.stringify({
                            type: "attack",
                            data: JSON.stringify({
                                position: {
                                    x: cell.y,
                                    y: cell.x
                                },
                                currentPlayer: -1,
                                status: cell.status
                            }),
                            id: 0
                        }));
                    });

                    if (isAlive) {
                        await sleep(1500);
                        await randomBotAttack(enemyField, game, data);
                    } else {
                        cr.getConnectionByUserId( game.fields[0].userId)?.webSocket.send(JSON.stringify({
                            type: "finish",
                            data: JSON.stringify({
                                winPlayer: -1
                            }),
                            id: 0
                        }));

                        let gameId = gc.getGameIndexByUserId(data.indexPlayer);
                        if (gameId !== -1) {
                            gc.allGames.splice(gameId, 1);
                        }
                    }
                }
            } else {
                if (game) {
                    game.fields.forEach(item => {
                        cr.getConnectionByUserId(item.userId)?.webSocket.send(JSON.stringify({
                            type: "attack",
                            data: JSON.stringify({
                                position: {
                                    x: randomAttackResult?.x,
                                    y: randomAttackResult?.y
                                },
                                currentPlayer: -1,
                                status: randomAttackResult?.status
                            }),
                            id: 0
                        }));
                    });
                    await sleep(1500);
                    await randomBotAttack(enemyField, game, data);
                }
            }
        }
    }

    function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}