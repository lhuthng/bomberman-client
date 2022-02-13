import Phaser from "phaser";

import Socket from "../misc/socket";
import Utils from "../misc/utils";
import RoomManager from "./support/room-list";

const socket = Socket();

export default class StartScene extends Phaser.Scene {
    constructor() {
        super();
        socket.establish();
        this.customEvent = Utils.event();
    }
    init() {

    }
    preload() {
        this.load.atlas('gui', './assets/atlas/gui.png', './assets/atlas/gui.json');
    }
    create() {
        const rootContainer = this.add.container();
        const roomManager = RoomManager(this, socket);
        rootContainer.add([roomManager.container]);

        const roomTimer = this.time.addEvent({
            delay: 500,
            callback: () => socket.emit('get rooms'),
            callbackScope: this,
            loop: true
        });
        const received = rooms => {
            roomManager.update(rooms);
        }
        socket.on('disconnect', () => {
            socket.off('connect');
            roomTimer.destroy();
        });
        socket.on('created player', (_, name) => {
            roomManager.setName(name);
        });
        socket.on('received rooms', received);
    }
    update() {
        this.customEvent.trigger('update');
    }
}