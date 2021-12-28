import Application from './Application.js';
import * as WebGL from './WebGL.js';
import GLTFLoader from './GLTFLoader.js';
import Renderer from './Renderer.js';
import Node from './Node.js';

const vec3 = glMatrix.vec3;
const mat4 = glMatrix.mat4;
const quat = glMatrix.quat;
let x = 0;
let y = 0;
let z = 0;
let jumped = false;
let stopJump = false;
let jumpCt = 0;
let curTrack = "mid";
let goLeft = false;
let goRight = false;
let premik = 0;
let speed = 1;
let game = false;
let gameOver = false;
var scoreElement = document.querySelector("#score");
var scoreNode = document.createTextNode("");
scoreElement.appendChild(scoreNode);
var writingElement = document.querySelector("#napis");
var writingNode = document.createTextNode("");
writingElement.appendChild(writingNode);
class App extends Application {

    async start() {
      console.log("sm")
        this.loader = new GLTFLoader();
        await this.loader.load('./models/map.gltf');
        console.log("sm2")
        print(this.loader.defaultScene)
        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        console.log("sm3")
        this.camera = await this.loader.loadNode('Camera');
        console.log("camera")
        this.character = await this.loader.loadNode('Camera');

        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
        this.keys = {};
        this.score = 0;



        if (!this.scene || !this.camera) {
            throw new Error('Scene or Camera not present in glTF');
        }

        if (!this.camera.camera) {
            throw new Error('Camera node does not contain a camera reference');
        }

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();
    }

    update(){

      if(this.scene && this.camera){
        if(this.keys['KeyS']){
          game = true;
        }
        if(!gameOver){
          writingNode.nodeValue = "To start the Game press 'S'!!";
        }
        if(game){
          writingNode.nodeValue = "";
          this.score++;
          scoreNode.nodeValue = this.score;
        if (this.keys['KeyW'] && !jumped) {
              this.keys['KeyW'] = false;
              x = this.character.translation[0];
              y = this.character.translation[1] + 9;
              z = this.character.translation[2];
              this.character.translation = vec3.fromValues(x, y, z);
              this.character.updateMatrix();
              jumped = true;
              jumpCt = 60;
        }
        if(jumped){
        if(jumpCt == 0){
            x = this.character.translation[0];
            y = this.character.translation[1] - 9;
            z = this.character.translation[2];
            this.character.translation = vec3.fromValues(x, y, z);
            this.character.updateMatrix();
            jumped = false;
        }
        else{
          jumpCt--;
        }
      }
        if(goRight && premik == 10){
          goRight = false;
          premik = 0;
        }
        if(goLeft && premik == 10){
          goLeft = false;
          premik = 0;
        }
        if(this.camera.translation[0] == -35){
          curTrack = "left";
        }
        else if(this.camera.translation[0] == 35){
          curTrack = "right";
        }
        else{
          curTrack = "mid";
        }
        if(goLeft){
          x = this.camera.translation[0] - 3.5;
          y = this.camera.translation[1];
          z = this.camera.translation[2];
          this.camera.translation = vec3.fromValues(x, y, z);
          this.camera.updateMatrix();
          x = this.character.translation[0] - 3.5;
          y = this.character.translation[1];
          z = this.character.translation[2];
          this.character.translation = vec3.fromValues(x, y, z);
          this.character.updateMatrix();
          premik++;
        }
        if(goRight){
          x = this.camera.translation[0] + 3.5;
          y = this.camera.translation[1];
          z = this.camera.translation[2];
          this.camera.translation = vec3.fromValues(x, y, z);
          this.camera.updateMatrix();
          x = this.character.translation[0] + 3.5;
          y = this.character.translation[1];
          z = this.character.translation[2];
          this.character.translation = vec3.fromValues(x, y, z);
          this.character.updateMatrix();
          premik++;
        }
        if(this.keys['KeyD'] && curTrack !="right" && !goRight){
          goRight = true;
          this.keys['KeyD'] = false;
        }
        if(this.keys['KeyA'] && curTrack !="left" && !goLeft){
          goLeft = true;
          this.keys['KeyA'] = false;
        }

        for(var i = 0; i < 42; i++){
            if(i == 30){
              i++;
            }
            if(i == 31){
              i++;
            }
            x = this.scene.nodes[i].translation[0];
            y = this.scene.nodes[i].translation[1];
            z = this.scene.nodes[i].translation[2] + speed;
            if(z > 550){
              z -= 935;
            }
            this.scene.nodes[i].translation = vec3.fromValues(x, y, z);
            this.scene.nodes[i].updateMatrix();
            if(i != 5 && i != 10 && i != 17 && i != 24 && i != 29
              && i != 30 && i != 31 && i != 32 && i != 39 && i != 40
              && i != 41 && i != 42){
              if(Math.abs(x - this.character.translation[0]) <= 15  &&
               Math.abs(y - this.character.translation[1]) <= 15 &&
                Math.abs(z - this.character.translation[2]) <= 15){
                  if(i >= 33 && i <= 37){
                    x = this.scene.nodes[i].translation[0];
                    y = this.scene.nodes[i].translation[1];
                    z = this.scene.nodes[i].translation[2] - 935;
                    this.scene.nodes[i].translation = vec3.fromValues(x, y, z);
                    this.scene.nodes[i].updateMatrix();
                    this.score+=100;
                  }
                  else{
                      speed = 0;
                      game = false;
                      gameOver = true;
                      writingNode.nodeValue = "Game Over!";
                  }
              }
            }
          }
        }
    }
}
    render() {
        if (this.renderer) {
            this.renderer.render(this.scene, this.camera, this.character);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        const aspectRatio = w / h;

        if (this.camera) {
            this.camera.camera.aspect = aspectRatio;
            this.camera.camera.updateMatrix();
        }
    }

    enable() {
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable() {
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);

});
