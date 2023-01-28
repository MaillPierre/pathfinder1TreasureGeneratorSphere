import * as EventEmitter from 'events';
import { v4 as uuid } from 'uuid';
import * as Rolls from './Rolls.js';

export class ArmorShieldObject extends EventEmitter {
    constructor(rollObject) {
        super();
        this.uuid = uuid();
        this.treasureObject = rollObject;
    }

    render() {
        var result = `<tr id=\"${this.uuid}\">`
        if (this.treasureObject.minPercent != this.treasureObject.maxPercent) {
            result += `<td>
                    ${this.treasureObject.minPercent}-${this.treasureObject.maxPercent}
                </td>`;
        } else {
            result += `<td>
                    ${this.treasureObject.minPercent}
                </td>`;
        }
        if (this.treasureObject.url != undefined) {
            result += `<td><a href=\"${this.treasureObject.url}\">${this.treasureObject.item}</a></td>`;
        } else {
            result += `<td>${this.treasureObject.item}</td>`;
        }
        result += `<td>${this.treasureObject.price}</td>
        </tr>`;
        return result;
    }
}

export class MoneyObject extends EventEmitter {
    constructor(valuesObject) {
        super();
        this.uuid = uuid();
        this.treasureObject = valuesObject;
    }

    addition(otherMoneyObject) {
        this.treasureObject.cp += otherMoneyObject.treasureObject.cp;
        this.treasureObject.sp += otherMoneyObject.treasureObject.sp;
        this.treasureObject.gp += otherMoneyObject.treasureObject.gp;
        this.treasureObject.pp += otherMoneyObject.treasureObject.pp;

        return this;
    }

    render() {
        var moneyString = "";
        if (this.treasureObject.cp !== undefined && this.treasureObject.cp != 0) {
            moneyString += `${this.treasureObject.cp} cp `;
        }
        if (this.treasureObject.sp != 0 && this.treasureObject.sp !== undefined) {
            moneyString += `${this.treasureObject.sp} sp `;
        }
        if (this.treasureObject.gp != 0 && this.treasureObject.gp !== undefined) {
            moneyString += `${this.treasureObject.gp} gp `;
        }
        if (this.treasureObject.pp != 0 && this.treasureObject.pp !== undefined) {
            moneyString += `${this.treasureObject.pp} pp `;
        }
        var result = `<tr id=\"${this.uuid}\">
        <td></td><td></td><td>${moneyString}</td>
        </tr>`;
        return result;
    }
}

export class GemObject extends EventEmitter {
    constructor(rollObject) {
        super();
        this.uuid = uuid();
        this.treasureObject = rollObject;
        this.marketValue = rollObject.baseValue;
        this.marketValue += Rolls.dices.rollDiceFormula(this.treasureObject.addedValue)
    }

    render() {
        var result = `<tr id=\"${this.uuid}\">`
        if (this.treasureObject.minPercent != this.treasureObject.maxPercent) {
            result += `<td>
                    ${this.treasureObject.minPercent}-${this.treasureObject.maxPercent}
                </td>`;
        } else {
            result += `<td>
                    ${this.treasureObject.minPercent}
                </td>`;
        }
        if (this.treasureObject.url != undefined) {
            result += `<td><a href=\"${this.treasureObject.url}\">${this.treasureObject.item}</a></td>`;
        } else {
            result += `<td>${this.treasureObject.item}</td>`;
        }
        result += `<td>${this.marketValue} po</td>
        </tr>`;
        return result;
    }
}

export class ArtObject extends EventEmitter {
    constructor(rollObject) {
        super();
        this.uuid = uuid();
        this.treasureObject = rollObject;
        this.marketValue = rollObject.value;
    }

    render() {
        var result = `<tr id=\"${this.uuid}\">`

        if (this.treasureObject.minPercent != this.treasureObject.maxPercent) {
            result += `<td>
                    ${this.treasureObject.minPercent}-${this.treasureObject.maxPercent}
                </td>`;
        } else {
            result += `<td>
                    ${this.treasureObject.minPercent}
                </td>`;
        }
        if (this.treasureObject.url != undefined) {
            result += `<td><a href=\"${this.treasureObject.url}\">${this.treasureObject.item}</a></td>`;
        } else {
            result += `<td>${this.treasureObject.item}</td>`;
        }
        result += `<td>${this.marketValue} po</td>
        </tr>`;
        return result;
    }
}

export class CompoundObject extends EventEmitter {

    constructor(rollObject) {
        super();
        this.uuid = uuid();
        this.treasureObject = rollObject;
        this.marketPrice = rollObject.marketPrice;
    }

    render() {
        var result = `<tr id=\"${this.uuid}\">`

        if (this.treasureObject.minPercent != this.treasureObject.maxPercent) {
            result += `<td>
                    ${this.treasureObject.minPercent}-${this.treasureObject.maxPercent}
                </td>`;
        } else {
            result += `<td>
                    ${this.treasureObject.minPercent}
                </td>`;
        }
        if (this.treasureObject.url != undefined) {
            result += `<td><a href=\"${this.treasureObject.url}\">${this.treasureObject.item}</a></td>`;
        } else {
            result += `<td>${this.treasureObject.item}</td>`;
        }
        result += `<td>${this.marketPrice} po</td>
        </tr>`;
        return result;
    }
}

export class ItemTable extends EventEmitter {

    constructor(itemArray = []) {
        super();
        this.uuid = uuid();
        this.itemArray = itemArray;
    }

    render() {
        var result = `<table id=\"${this.uuid}\" class=\"table\">
            <thead>
                <tr>
                    <th scope=\"col\">Roll</th>
                    <th scope=\"col\">Item</th>
                    <th scope=\"col\">Price</th>
                </tr>
            </thead>
            <tbody>`
        this.itemArray.forEach(item => {
            result += item.render();
        });
        result += `</tbody>
        </table>`;
        return result;
    }

    clear() {
        this.itemArray = [];
        this.emit("change");
    }

    addItem(rollObject) {
        this.itemArray.push(rollObject);
        this.emit("change");
    }

    addItems(rollObjectArray) {
        this.itemArray = this.itemArray.concat(rollObjectArray);
        this.emit("change");
    }
}