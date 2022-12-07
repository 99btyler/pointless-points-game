
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
            this.y -= (this.y >= texture.height ? texture.height : 0);
        });

        gameEventEmitter.register(events.KEYDOWN, () => {
            this.y += (this.y < ((texture.height * 6) - texture.height) ? texture.height : 0);
        });

        gameEventEmitter.register(events.KEYRIGHT, () => {
            this.x += (this.x < ((texture.width * 6) - texture.width) ? texture.width : 0);
        });

        gameEventEmitter.register(events.KEYLEFT, () => {
            this.x -= (this.x >= texture.width ? texture.width : 0);
        });

    }

}


const gameObjects = [];

const gameEventEmitter = new GameEventEmitter();
const events = {
    KEYUP: "KEYUP",
    KEYDOWN: "KEYDOWN",
    KEYRIGHT: "KEYRIGHT",
    KEYLEFT: "KEYLEFT"
};

const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");

let texturePlayer;

window.onload = async () => {
    
    // Load the textures
    texturePlayer = await loadTexture("./assets/player.jpg");

    // Create the game objects
    initGame();

    // Start drawing
    canvas.width = texturePlayer.width * 6;
    canvas.height = texturePlayer.height * 6;
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