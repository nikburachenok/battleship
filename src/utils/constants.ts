export enum MessageType {
    Registration = 'reg',
    NewRoom = 'create_room',
    AddUserToRoom = 'add_user_to_room',
    AddShips = 'add_ships',
    Attack = 'attack',
    RandomAttack = 'randomAttack',
    UpdateRoom = 'update_room',
    UpdateWinners = 'update_winners',
    CreateGame = 'create_game',
    StartGame = 'start_game',
    Turn = 'turn',
    Finish = 'finish'
}

export enum Ships {
    "small" = 1,
    "medium" = 2,
    "large" = 3,
    "huge" = 4
}