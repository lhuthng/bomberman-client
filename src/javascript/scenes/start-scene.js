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
        const container = this.add.container();
        const roomManager = RoomManager(this, socket);
        container.add([roomManager.container]);

        this.input.keyboard.on('keydown', event => {
            Global.focus.target && Global.focus.target.customEvent.trigger('keydown', event);
        });
    }
    update() {
        this.customEvent.trigger('update');
    }
}