import Global from "../../misc/global";
import Utils from "../../misc/utils";

const [ width, height, space, padding ] = [279, 35, 2, 5];
const capacityColors = ['#ff0000', '#0ababa', '#0ababa', '#ffff00', '#ff0000'];
const fontConfig = { fontFamily: 'default' };
const pivot = { x: 60, y: 70 };
const rect = { x: 342, y: 67, w: 4, h: 181 };
const RoomInfo = (scene, socket, pivot, roomData) => {
    let { id, name } = roomData;
    let playerCount = roomData.playerIds.filter(id => id !== null).length;
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
    const updatePlayerCount = newPlayerCount => {
        playerCount = newPlayerCount;
        roomCapacity.setText(`Players: ${playerCount}/${capacity}`);
        roomCapacity.setColor(capacityColors[playerCount]);
    }
    const updateCapacity = newCapacity => {
        capacity = newCapacity;
        roomCapacity.setText(`Players: ${playerCount}/${capacity}`);
        roomCapacity.setColor(capacityColors[playerCount]);
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
        const newPlayerCount = roomData.playerIds.filter(id => id !== null).length;
        const newCapacity = roomData.playerIds.length;
        newId !== id && updateId(newId);
        newName !== name && updateName(newName);
        newHost !== host && updateHost(newHost);
        newPlayerCount !== playerCount && updatePlayerCount(newPlayerCount);
        newCapacity !== capacity && updateCapacity(newCapacity);
    }
    const destroy = () => container.destroy();

    return { container, update, destroy };
}

const RoomSearcher = (scene, socket) => {
    const container = scene.add.container().setVisible(false);
    const listContainer = scene.add.container();
    const background = scene.add.image(0, 0, 'gui', 'room-search-box').setOrigin(0);
    const playerName = scene.add.text(130, 34, "", { color: "#af59ee" }).setOrigin(0.5, 1).setInteractive();
    const scrollBar = scene.add.rectangle(rect.x, rect.y, 0, 0, 0xff0000).setOrigin(0);
    const hostButton = scene.add.zone(322, 263, 16, 24).setOrigin(0).setInteractive();
    const zoneSize = { w: 284, h: 172 };
    const graphics = scene.make.graphics();
    graphics.fillRect(58, 70, zoneSize.w, zoneSize.h).setScale(2);
    const listMask = new Phaser.Display.Masks.GeometryMask(scene, graphics);
    listContainer.setMask(listMask);
    const zone = scene.add.zone(58, 70, zoneSize.w, zoneSize.h).setOrigin(0).setInteractive();
    container.add([background, zone, listContainer, scrollBar, hostButton, playerName]);

    // Player name
    let backupName = "";
    playerName.customEvent = Utils.event();
    playerName.customEvent.on('keydown', event => {
        if (event.keyCode === 8 && playerName.text.length > 0) playerName.text = playerName.text.substr(0, playerName.text.length - 1);
        else if ((event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode < 90)) && playerName.text.length < 7) playerName.text += event.key;
        else if (event.keyCode === 13) {
            Global.focus.setTarget();
            socket.emit('update name', playerName.text);
        }
    });
    playerName.customEvent.on('unfocus', () => {
        playerName.isTargeted = false;
        playerName.setStroke('#ee0000', 0);
    })
    playerName.on('pointerover', () => playerName.setStroke("#ee0000", 2));
    playerName.on('pointerout', () => !playerName.isTargeted && playerName.setStroke("#ee0000", 0));
    playerName.on('pointerdown', () => Global.focus.setTarget(playerName));

    // Scroll-panel
    let scrollSpeed = 0, zoneHeight = 0;
    scene.customEvent.on('update', () => {
        if (scrollSpeed !== 0) {
            let newY = listContainer.y + scrollSpeed;
            const backup = scrollSpeed;
            scrollSpeed = 0;
            if (zoneHeight >= zoneSize.h && newY < zoneSize.h - zoneHeight) newY = zoneSize.h - zoneHeight;  
            else if (zoneHeight < zoneSize.h) newY = listContainer.y; 
            else if (newY > 0) newY = 0;
            else scrollSpeed = backup;
            scrollSpeed = Phaser.Math.Linear(scrollSpeed, 0, 0.4);
            scrollBar.setY(rect.y - newY * (scrollBar.height / rect.h));
            listContainer.setY(newY);
        }
    });
    zone.on('wheel', (pointer) => {
        if (pointer.deltaY > 0) scrollSpeed = 10; 
        else if (pointer.deltaY < 0) scrollSpeed = -10; 
    });
    const updateScrollBar = () => {
        zoneHeight = list.length * height + (list.length - 1) * space;
        if (zoneHeight < 0) zoneHeight = 0;
        if (zoneHeight < zoneSize.h) {
            scrollBar.setY(rect.y);
            scrollBar.setSize(rect.w, 0);
            listContainer.setY(Math.max(0, listContainer.y));
        }
        else {
            const scrollBarHeight = rect.h * (zoneSize.h / zoneHeight);
            scrollBar.setSize(rect.w, scrollBarHeight);
        }
    }

    // Update rooms
    const list = [];
    const update = rooms => {
        let minLength = list.length < rooms.length ? list.length : rooms.length;
        for (let index = 0; index < minLength; index++) list[index].update(rooms[index]);
        while (minLength < rooms.length) {
            const roomInfo = RoomInfo(scene, socket, { x: pivot.x, y: pivot.y + (space + height) * minLength }, rooms[minLength++]);
            listContainer.add(roomInfo.container);
            list.push(roomInfo);
            updateScrollBar();
        }
        while (minLength < list.length) {
            list.pop().destroy();
            updateScrollBar();
        }
    }

    // Socket

    const createRoom = () => {
        socket.emit('create room', 4);
    }
    let playerId;
    const onCreatedPlayer = (id, name) => {
        backupName = name;
        playerId = id;
        playerName.setText(name);
    }
    const onUpdatedName = (name) => {
        backupName = name;
        playerName.setText(name);
    }
    const onFailedUpdatingName = () => {
        playerName.text = backupName;
    }
    const onReceivedRoom = (rooms) => {
        update(rooms);
    }
    const eventMapping = {
        'created player': onCreatedPlayer,
        'updated name': onUpdatedName,
        'failed updating name': onFailedUpdatingName,
        'received rooms': onReceivedRoom
    }
    let previous;
    const toggle = (value) => {
        if (value !== 'on' && value !== 'off') return;
        if (value !== previous) {
            for (const name in eventMapping) socket[value](name, eventMapping[name]);
            hostButton[value]('pointerdown', createRoom);
        }
        previous = value;
    }

    // Destroy 
    const destroy = () => {
        list.forEach(roomInfo => roomInfo.destroy());
        list.length = 0;
    }

    // 

    const roomTimer = scene.time.addEvent({
        delay: 500,
        callback: () => socket.emit('get rooms'),
        callbackScope: this,
        loop: true
    });
    roomTimer.paused = true;
    let status = "deactivated";
    const deactivate = () => {
        toggle('off');
        roomTimer.paused = true;
        container.setVisible(false);
        status = "deactivated";
    }

    const activate = () => {
        toggle('on');
        roomTimer.paused = false;
        container.setVisible(true);
        status = "activated";
        console.log(status);
    }

    //


    return { container, activate, deactivate, getStatus: () => status };
}

const Room = (scene, socket) => {
    const container = scene.add.container().setVisible(false);
    const background = scene.add.image(52, 77, 'gui', 'room').setOrigin(0);
    const playerContainer = scene.add.container();
    const leaveZone = scene.add.zone(54, 235, 27, 38).setOrigin(0).setInteractive();
    const startZone = scene.add.zone(319, 235, 27, 38).setOrigin(0).setInteractive();
    // const chatContainer = scene.add.container();
    const playerAvatars = [];
    const playerFrames = [];
    const playerNames = [];
    for (let index = 0; index < 4; index++) {
        const x = 113 + 58 * index, y = 247;
        playerAvatars.push(scene.add.image(x, y, 'gui', 'open-slot'));
        playerFrames.push(scene.add.image(x, y, 'gui', 'player-frame').setVisible(false));
        playerNames.push(scene.add.text(x, y + 40, "").setOrigin(0.5, 0.5).setFontSize(10).setVisible(false));
    }
    playerContainer.add(playerAvatars);
    playerContainer.add(playerFrames);
    playerContainer.add(playerNames);

    container.add([ background, playerContainer, leaveZone, startZone ]);
    //
    leaveZone.on('pointerdown', () => {
        console.log('hi');
        socket.emit('leave room', roomId);
    })
    //
    let roomId, hostId;
    const indexMapping = { };
    const onBroadcastJoinedRoom = (playerId, playerName, index) => {
        indexMapping[playerId] = index;
        playerAvatars[index].setTexture('gui', 'apprentice-avatar');
        playerFrames[index].setTexture('gui', 'player-frame').setVisible(true);
        playerNames[index].setText(playerName).setVisible(true);
    };
    const onBroadcastLeftRoom = (playerId) => {
        console.log(playerId, indexMapping);
        const index = indexMapping[playerId];
        playerAvatars[index].setTexture('gui', 'open-slot');
        playerFrames[index].setVisible(false);
        playerNames[index].setVisible(false);
        delete indexMapping[playerId];
    };
    const onPromotedHost = (playerId) => {
        hostId = playerId;
        playerFrames[indexMapping[playerId]].setTexture('gui', 'host-frame');
    }
    const eventMapping = {
        'broadcast joined room': onBroadcastJoinedRoom,
        'broadcast left room': onBroadcastLeftRoom,
        'promoted host': onPromotedHost
    };
    let previous;
    const toggle = (value) => {
        if (value !== 'on' && value !== 'off') return;
        if (value !== previous) {
            for (const name in eventMapping) 
                socket[value](name, eventMapping[name]);
        }
        previous = value;
    }

    // Init room
    const initRoom = (room) => {
        roomId = room.id;
        hostId = room.hostId;
        for (let index = 0; index < room.playerIds.length; index++) {
            if (room.playerIds[index] !== null) {
                indexMapping[room.playerIds[index]] = index;
                playerAvatars[index].setTexture('gui', 'apprentice-avatar');
                if (room.playerIds[index] === hostId) {
                    playerFrames[index].setTexture('gui', 'host-frame').setVisible(true);
                }
                else playerFrames[index].setTexture('gui', 'player-frame').setVisible(true);
                playerNames[index].setText(room.playerNames[index]).setVisible(true);
            }
            else {
                playerAvatars[index].setTexture('gui', 'open-slot');
                playerFrames[index].setVisible(false);
                playerNames[index].setVisible(false);
            }
        }
    }

    // 
    let status = "deactivated";
    const deactivate = () => {
        container.setVisible(false);
        toggle('off');
        status = "deactivated";
    }

    const activate = () => {
        container.setVisible(true);
        toggle('on');
        status = "activated"
    }

    return { container, initRoom, activate, deactivate, getStatus: () => status };
}

const RoomManager = (scene, socket) => {
    const container = scene.add.container().setScale(2);
    const roomSearcher = RoomSearcher(scene, socket);
    const room = Room(scene, socket);

    roomSearcher.activate();

    // socket.on('created room');
    const initRoom = (roomInfo) => {
        if (roomSearcher.getStatus() === "activated" && room.getStatus() === "deactivated") {
            roomSearcher.deactivate();
            room.initRoom(roomInfo);
            room.activate();
        }
        else console.log("WTF");
    } 
    socket.on('created room', initRoom);
    socket.on('joined room', initRoom);
    socket.on('left room', () => {
        if (roomSearcher.getStatus() === "deactivated" && room.getStatus() === "activated") {
            room.deactivate();
            roomSearcher.activate();
        }
        else console.log("WTF");
    });

    container.add([ roomSearcher.container, room.container ]);
    return { container };
}

export default RoomManager;