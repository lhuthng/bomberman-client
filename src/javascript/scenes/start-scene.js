import Phaser from "phaser";
import Global from "../misc/global";

import Socket from "../misc/socket";
import Utils from "../misc/utils";
import RoomManager from "./support/room-manager";

const socket = Socket();

export default class StartScene extends Phaser.Scene {
    constructor() {
        super('start-scene');
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
        socket.on('disconnect', () => {
            socket.off('connect');
            roomTimer.destroy();
        });

        this.input.keyboard.on('keydown', event => {
            Global.focus.target && Global.focus.target.customEvent.trigger('keydown', event);
        });
    }
    update() {
        this.customEvent.trigger('update');
    }
}