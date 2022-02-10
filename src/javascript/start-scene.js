import Phaser from "phaser";

import Socket from "./socket";

const socket = Socket();

export default class StartScene extends Phaser.Scene {
    constructor() {
        super();
        socket.establish();
    }
    init() {

    }
    preload() {

    }
    create() {
        const text = this.add.text(100, 100, "");
        const timer = this.time.addEvent({
            delay: 500,
            callback: () => socket.emit('get rooms'),
            callbackScope: this,
            loop: true
        });
        socket.on('created player', (_, name) => {
            text.setText(name);
            const host = this.add.text(500, 500, "host");
            host.setInteractive();
            host.on('pointerdown', () => {
              socket.emit('create room', 'kungfu panda');
              timer.destroy();
            })
        });
        socket.on('received rooms', rooms => {
            console.log(rooms);
        });
    }
}