import { Node } from "./Node.js";

export class Light extends Node {
    constructor() {
        super();

        Object.assign(this, {
            position         : [10,35,25],
            ambientColor     : [255,255,255],
            diffuseColor     : [255,255,255],
            specularColor    : [255, 255, 255],
            shininess        : 10,
            attenuatuion     : [1.0, 0.02, 0]
        });
    }

}