import { io } from 'socket.io-client';

class Socket {
    constructor() {
        this.establish = this.establish.bind(this);
        this.on = this.on.bind(this);
        this.off = this.off.bind(this);
        this.emit = this.emit.bind(this);
    }
    establish() {
        if (this.socket === undefined) {
            this.socket = io.connect();
            const socket = this.socket;
            this.status = 'Requesting'
            socket.on('connect', () => {
                this.status = 'Connected';
                console.log(`Socket is connected.`);
            });
            socket.on('disconnect', () => {
                this.status = 'Disconnected';
                console.log(`Socket is disconnected.`);
            });
            socket.on('created player', (pid, name) => {
                this.status = "Ready"
                console.log(pid, name, 'is created (player)');
            });
            socket.on('created room', (rid) => {
                this.status = "Hosted"
                console.log(rid, 'is created (room)');
            });
        }
    }
    on(name, callback) {
        this.socket && this.socket.on(name, callback);
    }
    off(name, callback) {
        this.socket && this.socket.off(name, callback);
    }
    emit(name, ...args) {
        this.socket && this.socket.emit(name, ...args);
    }
}
let socket;

export default () => {
    if (socket === undefined) socket = new Socket();
    return socket;
};