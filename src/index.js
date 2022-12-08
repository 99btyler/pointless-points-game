
class GameObject {

    constructor(texture, x, y) {
        this.texture = texture;
        this.x = x;
        this.y = y;
    }

    draw() {
        canvasContext.drawImage(this.texture, this.x, this.y);
    }

}

class GameEventEmitter {

    constructor() {
        this.listeners = {};
    }

    register(eventName, action) {

        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }

        this.listeners[eventName].push(action);

    }

    emit(eventName) {

        if (!this.listeners[eventName]) {
            return;
        }

        this.listeners[eventName].forEach((action) => action());

    }

}

class Player extends GameObject {

    constructor(texture, x, y) {

        super(texture, x, y);

        gameEventEmitter.register(events.KEYUP, () => {
            if (this.y >= texture.height) {
                this.y -= texture.height;
                gameEventEmitter.emit(events.PLAYERMOVE);
            }
        });

        gameEventEmitter.register(events.KEYDOWN, () => {
            if (this.y < (texture.height * TEXTURES_PER_COLUMN) - texture.height) {
                this.y += texture.height;
                gameEventEmitter.emit(events.PLAYERMOVE);
            }
        });

        gameEventEmitter.register(events.KEYRIGHT, () => {
            if (this.x < (texture.width * TEXTURES_PER_ROW) - texture.width) {
                this.x += texture.width;
                gameEventEmitter.emit(events.PLAYERMOVE);
            }
        });

        gameEventEmitter.register(events.KEYLEFT, () => {
            if (this.x >= texture.width) {
                this.x -= texture.width;
                gameEventEmitter.emit(events.PLAYERMOVE);
            }
        });

    }

}

class Point extends GameObject {

    constructor(texture, x, y) {
        super(texture, x, y);
    }

}


const TEXTURES_PER_ROW = 6;
const TEXTURES_PER_COLUMN = 6;

const gameObjects = [];
const gameEventEmitter = new GameEventEmitter();
const events = {

    KEYUP: "KEYUP",
    KEYDOWN: "KEYDOWN",
    KEYRIGHT: "KEYRIGHT",
    KEYLEFT: "KEYLEFT",

    PLAYERMOVE: "PLAYERMOVE"

};

const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");

let texturePlayer;
let texturePoint;

window.onload = async () => {
    
    // Load the textures
    texturePlayer = await loadTexture("./assets/player.jpg");
    texturePoint = await loadTexture("./assets/point.png");

    // Create the game objects
    initGame();

    // Start drawing
    canvas.width = texturePlayer.width * TEXTURES_PER_ROW;
    canvas.height = texturePlayer.height * TEXTURES_PER_COLUMN;
    canvasContext.fillStyle = "#202020";

    window.requestAnimationFrame(drawGame);

}

function loadTexture(path) {
    return new Promise((resolve) => {
        const texture = new Image();
        texture.src = path;
        texture.onload = () => {
            resolve(texture);
        }
    });
}

function initGame() {

    gameObjects.push(new Player(texturePlayer, 0, 0));
    
    for (let x = 0; x <= ((texturePlayer.width * TEXTURES_PER_ROW) - texturePlayer.width); x += texturePlayer.width) {
        for (let y = 0; y <= ((texturePlayer.height * TEXTURES_PER_COLUMN) - texturePlayer.height); y += texturePlayer.height) {
            gameObjects.push(new Point(texturePoint, x, y));
        }
    }

}

function drawGame() {

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    gameObjects.forEach((gameObject) => gameObject.draw());

    window.requestAnimationFrame(drawGame);

}


window.addEventListener("keydown", (e) => {

    if (e.repeat) {
        return;
    }

    switch (e.key) {
        case "ArrowUp":
            gameEventEmitter.emit(events.KEYUP);
            break;
        case "ArrowDown":
            gameEventEmitter.emit(events.KEYDOWN);
            break;
        case "ArrowRight":
            gameEventEmitter.emit(events.KEYRIGHT);
            break;
        case "ArrowLeft":
            gameEventEmitter.emit(events.KEYLEFT);
            break;
    }

});