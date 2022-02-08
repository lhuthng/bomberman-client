import Phaser from "phaser";
import Command from './command';

const command = new Command();

class Stage extends Phaser.Scene {
    constructor() {
        super();
        this.data = {}
    }
    preload() {
        this.load.path = '../assets/';
    }
    create() {

    }
    update() {

    }
}

const config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    backgroundColor: 0,
    parent: 'canvas',
    render: { pixelArt: true },
    physics: {
        default: 'arcade',
        arcade: { debug: true }
    },
    scene: [ Stage ]
}
