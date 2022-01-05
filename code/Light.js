import { Node } from "./Node.js";

export class Light extends Node {
    constructor() {
        super();

        Object.assign(this, {
            position         : [-0.4165380001068115,
                3.5336101055145264,
                54.970298767089844],
            ambientColor     : [51, 51, 51],
            diffuseColor     : [204, 204, 204],
            specularColor    : [255, 255, 255],
            shininess        : 10,
            attenuatuion     : [1.0, 0, 0.02]
        });
    }

}