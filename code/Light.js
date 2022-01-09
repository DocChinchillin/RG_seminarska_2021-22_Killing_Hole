import { Node } from "./Node.js";

export class Light extends Node {
  constructor() {
    super();

    Object.assign(this, {
      position: [-15, 40, 0],
      ambientColor: [200, 200, 200],
      diffuseColor: [255, 255, 255],
      specularColor: [100, 100, 100],
      shininess: 10,
      attenuatuion: [1.0, 0.015, 0],
    });
  }
}
