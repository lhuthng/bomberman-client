import Global from "../../misc/global";
import socket from "../../misc/socket";
import Utils from "../../misc/utils";

const [ width, height, space, padding ] = [279, 35, 2, 5];
const capacityColors = ['#ff0000', '#0ababa', '#0ababa', '#ffff00', '#ff0000'];
const fontConfig = { fontFamily: 'default' };
const Room = (scene, socket, pivot, roomData) => {
    let { id, name } = roomData;
    let capacity = roomData.playerIds.length;
    let host = roomData.playerNames[roomData.playerIds.findIndex(id => id === roomData.hostId)];
    const background = scene.add.image(pivot.x, pivot.y, 'gui', 'room-box').setOrigin(0);
    const joinButton = scene.add.image(pivot.x + width - padding, pivot.y + height - padding, 'gui', 'join-button').setOrigin(1, 1);
    const roomName = scene.add.text(pivot.x + padding, pivot.y + padding, "", fontConfig).setOrigin(0);
    const roomCapacity = scene.add.text(pivot.x + width - padding, pivot.y + padding, "", fontConfig).setOrigin(1, 0);
    const roomHost = scene.add.text(pivot.x + padding, pivot.y + height - padding, "", fontConfig).setOrigin(0, 1);
    const updateName = newName => {
        name = newName;
        roomName.setText(newName);
    }
    updateName(name);
    const updateCapacity = newCapacity => {
        capacity = newCapacity;
        roomCapacity.setText(`Players: ${capacity}/4`);
        roomCapacity.setColor(capacityColors[capacity]);
    }
    updateCapacity(capacity);
    const updateHost = newHost => {
        host = newHost;
        roomHost.setText(`By ${host} (${id})`);
    }
    updateHost(host);
    const updateId = newId => {
        id = newId;
        roomHost.setText(`By ${host} (${id})`);
    }

    joinButton.setInteractive();
    joinButton.on('pointerdown', () => {
        socket.emit('join room', id);
    });

    const container = scene.add.container();
    [background, roomName, roomCapacity, roomHost, joinButton].forEach(obj => container.add(obj));
    roomName.setColor('#0ababa');

    const update = (roomData) => {
        const newId = roomData.id;
        const newName = roomData.name;
        const newHost = roomData.playerNames[roomData.playerIds.findIndex(id => id === roomData.hostId)]
        const newCapacity = roomData.playerIds.length;
        newId !== id && updateId(newId);
        newName !== name && updateName(newName);
        newHost !== host && updateHost(newHost);
        newCapacity !== capacity &&updateCapacity(newCapacity);
    }
    const destroy = () => container.destroy();

    return { container, update, destroy };
}

const RoomManager = (scene, socket) => {
    const container = scene.add.container().setScale(2);
    const listContainer = scene.add.container();
    let list = [];
    const pivot = { x: 60, y: 70 };

    const background = scene.add.image(0, 0, 'gui', 'background').setOrigin(0);
    const playerName = scene.add.text(130, 34, "", { color: "#af59ee" }).setOrigin(0.5, 1).setInteractive();
    let backupName = "";

    const rect = { x: 342, y: 67, w: 4, h: 181 };
    const scrollBar = scene.add.rectangle(rect.x, rect.y, 0, 0, 0xff0000).setOrigin(0);
    const hostButton = scene.add.zone(322, 263, 16, 24).setOrigin(0).setInteractive();
    
    playerName.customEvent = Utils.event();
    playerName.customEvent.on('keydown', event => {
        if (event.keyCode === 8 && playerName.text.length > 0)
        {
            playerName.text = playerName.text.substr(0, playerName.text.length - 1);
        }
        else if (event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode < 90))
        {
            if (playerName.text.length < 7) playerName.text += event.key;
        }
        else if (event.keyCode === 13) {
            Global.focus.setTarget();
            socket.emit('update name', playerName.text);
        }
    });
    playerName.customEvent.on('unfocus', () => {
        playerName.isTargeted = false;
        playerName.setStroke('#ee0000', 0);
    })
    playerName.on('pointerover', () => {
        playerName.setStroke("#ee0000", 2);
    });
    playerName.on('pointerout', () => {
        if (!playerName.isTargeted) playerName.setStroke("#ee0000", 0);
    })
    playerName.on('pointerdown', () => {
        Global.focus.setTarget(playerName);
        playerName.isTargeted = true;
    });
    
    let roomId;
    socket.on('created room', id => {
        roomId = id;
    });
    const createRoom = () => {
        socket.emit('create room', 'kungfu panda');
    }
    const leaveRoom = () => {
        socket.emit('leave room', roomId);
    }
    let action = createRoom;
    hostButton.on('pointerdown', () => {
        action();
        action = action === createRoom ? leaveRoom : createRoom;
    });

    const graphics = scene.make.graphics();
    const zoneSize = { w: 284, h: 172 };
    graphics.fillRect(58, 70, zoneSize.w, zoneSize.h).setScale(2);
    const zone = scene.add.zone(58, 70, zoneSize.w, zoneSize.h).setOrigin(0).setInteractive();
    const mask = new Phaser.Display.Masks.GeometryMask(scene, graphics);
    listContainer.setMask(mask);

    let scrollSpeed = 0;
    let zoneHeight = 0;
    
    scene.customEvent.on('update', () => {
        if (scrollSpeed !== 0) {
            let newY = listContainer.y + scrollSpeed;
            if (zoneHeight >= zoneSize.h && newY < zoneSize.h - zoneHeight) {
                newY = zoneSize.h - zoneHeight;
                scrollSpeed = 0;
            }
            else if (zoneHeight < zoneSize.h) {
                newY = listContainer.y;
                scrollSpeed = 0;
            }
            else if (newY > 0) {
                newY = 0;
                scrollSpeed = 0;
            }
            scrollSpeed = Phaser.Math.Linear(scrollSpeed, 0, 0.4);
            scrollBar.setY(rect.y - newY * (scrollBar.height / rect.h));
            listContainer.y = newY;
        }
    });

    zone.on('wheel', (pointer) => {
        if (pointer.deltaY > 0) {
            scrollSpeed = 10;
        }
        else if (pointer.deltaY < 0) {
            scrollSpeed = -10;
        }
    });

    container.add([background, zone, listContainer, scrollBar, hostButton, playerName]);

    const updateScrollBar = () => {
        zoneHeight = list.length * height + (list.length - 1) * space;
        if (zoneHeight < 0) zoneHeight = 0;
        if (zoneHeight < zoneSize.h) {
            scrollBar.setY(rect.y);
            scrollBar.setSize(rect.w, 0);
            if (listContainer.y < 0) listContainer.y = 0;
        }
        else {
            const scrollBarHeight = rect.h * (zoneSize.h / zoneHeight);
            scrollBar.setSize(rect.w, scrollBarHeight);
        }
    }
    const update = rooms => {
        let minLength = list.length < rooms.length ? list.length : rooms.length;
        for (let index = 0; index < minLength; index++) list[index].update(rooms[index]);
        while (minLength < rooms.length) {
            const room = Room(scene, socket, { x: pivot.x, y: pivot.y + (space + height) * minLength }, rooms[minLength++]);
            listContainer.add(room.container);
            list.push(room);
            updateScrollBar();
        }
        while (minLength < list.length) {
            list.pop().destroy();
            updateScrollBar();
        }
    }
    const destroy = () => {
        list.forEach(room => room.destroy());
        list.length = 0;
    }
    
    socket.on('created player', (_, name) => {
        backupName = name;
        playerName.text = name;
    });
    socket.on('updated name', name => {
        console.log('updated', name);
        backupName = name;
        playerName.text = name;
    });
    socket.on('failed updating name', () => {
        console.log('failed updating name');
        playerName.text = backupName;
    });
    socket.on('received rooms', (rooms) => {
        update(rooms);
    });
    return { container, update, destroy };
}

export default RoomManager;