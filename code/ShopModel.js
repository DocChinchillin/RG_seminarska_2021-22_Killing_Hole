import { Node } from './Node.js';

export class ShopModel extends Node {

    constructor(mesh, image, options) {
        super(options);
        this.mesh = mesh;
        this.image = image;
        this.price = options.price;
        this.ammoPrice = options.ammoPrice;
        this.inInventory = options.inInventory || false;
        this.itemName = options.itemName;
    }

}
