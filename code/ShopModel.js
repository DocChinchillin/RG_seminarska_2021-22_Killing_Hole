import { Node } from "./Node.js";

export class ShopModel extends Node {
    constructor(options) {
        super(options);
        this.inInventory = options.extras.inInventory || false;
        this.price = options.extras.price;
        this.ammoPrice = options.extras.ammoPrice;
        this.type = options.extras.type;
        this.name = options.extras.name;
    }

}