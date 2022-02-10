import Phaser from "phaser";
import StartScene from "./start-scene";

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
    scene: [ StartScene ]
}

const game = new Phaser.Game(config);