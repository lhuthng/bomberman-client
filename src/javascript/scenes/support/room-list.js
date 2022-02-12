import socket from "../../misc/socket";

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
    const pivot = { x: 60, y: 72 };

    const background = scene.add.image(0, 0, 'gui', 'background').setOrigin(0);
    const playerName = scene.add.text(130, 32, "", { color: "#af59ee" }).setOrigin(0.5, 1);

    const scrollBarProps = {
        rect: { x: 342, y: 65, w: 4, h: 180 },
        getRect: function(topPercent, bottomPercent) {
            return {
                top: this.y + this.h * topPercent,
                bottom: this.y + this.h * bottomPercent
            }
        }
    }
    const rect = scrollBarProps.rect;
    const scrollBar = scene.add.rectangle(rect.x, rect.y, rect.w, 0, 0xff0000).setOrigin(0);
    const hostButton = scene.add.zone(322, 263, 16, 24).setOrigin(0).setInteractive();
    
    
    let roomId;
    socket.on('created room', id => {
        roomId = id;
    });
    const createRoom = () => {
        console.log('created');
        socket.emit('create room', 'kungfu panda');
    }
    const leaveRoom = () => {
        console.log('left');
        socket.emit('leave room', roomId);
    }
    let action = createRoom;
    hostButton.on('pointerdown', () => {
        action();
        action = action === createRoom ? leaveRoom : createRoom;
    });

    const graphics = scene.make.graphics();

    graphics.fillRect(58, 70, 284, 172).setScale(2);
    const mask = new Phaser.Display.Masks.GeometryMask(scene, graphics);
    listContainer.setMask(mask);

    container.add([background, listContainer, scrollBar, hostButton, playerName]);
    const setName = name => {
        playerName.setText(name);
    }
    const updateScrollBar = () => {
        const max = list.length * (height + space) - list.length;
        if (max < 172) scrollBar.setSize(rect.w, 0);
        else {
            const scrollBarHeight = rect.h * (172 / max);
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
    return { container, setName, update, destroy };
}

export default RoomManager;