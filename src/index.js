
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

    clear() {
        this.listeners = {};
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
            if (this.y < (texture.height * textures_per_side) - texture.height) {
                this.y += texture.height;
                gameEventEmitter.emit(events.PLAYERMOVE);
            }
        });
        gameEventEmitter.register(events.KEYRIGHT, () => {
            if (this.x < (texture.width * textures_per_side) - texture.width) {
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

        gameEventEmitter.register(events.PLAYERMOVE, () => {

            for (let i = 1; i < gameObjects.length; i++) {
                const point = gameObjects[i];
                if (point.x === this.x && point.y === this.y) {
                    return; // point was already earned
                }
            }
            gameObjects.push(new Point(texturePoint, this.x, this.y));

            if (gameObjects.length >= (textures_per_side * textures_per_side)+1) {

                // settings update
                if (textures_per_side >= max_textures_per_side) {
                    textures_per_side = min_textures_per_side;
                    startingX = 0;
                    startingY = 0;
                } else {
                    textures_per_side += 2;
                    startingX = this.x;
                    startingY = this.y;
                }

                // Recreate the game objects
                resetGame();

            }

        })

    }

}

class Point extends GameObject {

    constructor(texture, x, y) {
        super(texture, x, y);
    }

}


const gameObjects = [];
const gameEventEmitter = new GameEventEmitter();
const events = {

    KEYUP: "KEYUP",
    KEYDOWN: "KEYDOWN",
    KEYRIGHT: "KEYRIGHT",
    KEYLEFT: "KEYLEFT",

    PLAYERMOVE: "PLAYERMOVE"

};

// settings
const min_textures_per_side = 3;
const max_textures_per_side = 9;
let textures_per_side = min_textures_per_side;
let startingX = 0;
let startingY = 0;

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

    // Set the screen size
    canvas.width = texturePlayer.width * textures_per_side;
    canvas.height = texturePlayer.height * textures_per_side;

    gameObjects.push(new Player(texturePlayer, startingX, startingY));
    gameObjects.push(new Point(texturePoint, startingX, startingY));

}

function drawGame() {

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    canvasContext.fillStyle = "#202020";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    gameObjects.forEach((gameObject) => gameObject.draw());

    window.requestAnimationFrame(drawGame);

}

function resetGame() {

    while (gameObjects.length > 0) {
        gameObjects.pop();
    }
    gameEventEmitter.clear();

    initGame();

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