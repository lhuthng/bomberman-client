import { io } from 'socket.io-client';

export default class Command {
    constructor() {
        const socket = io.connect();
        let expected = ['disconnect', 'created player', 'failed creating player'];
        socket.on('connect', () => {
            console.log(`${socket} is connected.`);
        });
        socket.on('disconnect', () => {
            console.log(`${socket} is disconnected.`);
        });
        socket.on('created player', (pid) => {
            console.log(pid);
            socket.emit('create room', 'kungfu panda', pid);
        });
        socket.on('created room', (rid) => {
            console.log(rid);
        })
        this.socket = socket;
    }
}