export type ShipData = {
    type: "small" | "medium" | "large" | "huge"
    position: {
        x: number,
        y: number
    },
    length: number,
    direction: boolean
}[]