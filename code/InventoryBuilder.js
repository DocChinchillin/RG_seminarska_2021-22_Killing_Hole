import { Gun } from "./Gun.js";
import { Inventory } from "./Inventory.js";
import { Mesh } from "./Mesh.js";

export class InventoryBuilder {
    constructor(spec) {
        this.spec = spec;
    }

    createNode(spec) {
        switch (spec.type) {
            case 'gun': {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                return new Gun(mesh, texture, spec);
            }
        }
    }

    build() {
        let inventory = new Inventory();
        this.spec.nodes.forEach(spec => inventory.addNode(this.createNode(spec)));
        
        return inventory;
    }
}