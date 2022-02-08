import { io } from "socket.io-client";

export default class Command {
    constructor() {
        const socket = io.connect();
        socket.on('connect', () => {
            console.log(`${socket} is connected.`);
        });
        socket.on('disconnect', () => {
            console.log(`${socket} is disconnected.`);
        });
        this.socket = socket;
    }
}