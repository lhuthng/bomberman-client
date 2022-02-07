import logo from './logo.svg';
import './App.css';
import Phaser from 'phaser';
import { useState, useEffect } from 'react';

const game = {
  width: "100%",
  height: "100%",
  type: Phaser.AUTO,
  scene: {
    init: function() {
      this.cameras.main.setBackgroundColor('#24252A')
    },
    create: function() {
      this.helloWorld = this.add.text(
        this.cameras.main.centerX, 
        this.cameras.main.centerY, 
        "Hello World", { 
          font: "40px Arial", 
          fill: "#ffffff" 
        }
      );
      this.helloWorld.setOrigin(0.5);
    },
    update: function() {
      this.helloWorld.angle += 1;
    }
  }
}

function App() {
  const [state, setState] = useState({});
  useEffect(() => {
    
  });
  return (
    <IonPhaser game={game} />
  );
}

export default App;
