import $ from 'jquery';
import * as EventEmitter from 'events';
import { v4 as uuid } from 'uuid';


import compoundsFile from "../../data/compounds.json";
import gemsFile from "../../data/gems.json";
import artFile from "../../data/art.json";
import treasureValuePerEncounterFile from "../../data/treasureValuePerEncounter.json";
import armorShieldFile from "../../data/armorShield.json";

var treasureObject = {
    gems: gemsFile,
    art: artFile,
    compounds: compoundsFile,
    armorShield: armorShieldFile
}

import typeAFile from "../../data/typeA.json";
import typeBFile from "../../data/typeB.json";
import typeCFile from "../../data/typeC.json";

// http://spheresofpower.wikidot.com/loot-tables


const dices = {
    roll: function (intMax) {
        return Math.floor(Math.random() * intMax) + 1;
    },

    rollDiceFormula: function (rollString) {
        /* function to parse and calculate dice roll formulas.
        *  like 3d6 + 2d10 = 3 rolls of 6 sided dice + 2 rolls of 10 sided
        *  Return one number, or array of numbers if rolls > 1
        *  By @BitOfGold
        */
        function rollDice(formula, rolls = 1) {
            var rr = (t, s) => {
                var v = 0;
                for (var i = 1; i <= t; i++) {
                    v += 1 + Math.floor(Math.random() * s);
                }
                return v;
            };
            var f = formula
                .toLowerCase()
                .replace(/x/g, "*")
                .replace(/[^\+\-\*\/\(\)0-9\.d]/g, "")
                .replace(/([0-9]+)d([0-9]+)/g, "rr($1,$2)")
                .replace(/d([0-9]+)/g, "rr(1,$1)");
            var ansl = [];
            var ans = 0;
            for (var ti = 1; ti <= rolls; ti++) {
                try {
                    eval("ans=" + f + ";");
                } catch (e) {
                    return false;
                }
                ansl[ansl.length] = ans;
            }
            if (rolls < 2) {
                return ans;
            } else {
                return ansl;
            }
        }
        return rollDice(rollString);
    },

    roll100: function () {
        return this.roll(100);
    }
}

class ItemTable extends EventEmitter {

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

}

const treasureValuePerEncounter = {
    slowProgressName: "Slow",
    mediumProgressName: "Medium",
    fastProgressName: "Fast",

    defaultTreasureBudgetModifier: 1,

    valueForProgress(progressName, apl, treasureBudgetModifier = this.defaultTreasureBudgetModifier) {
        var result = 0;
        if (this.slowProgressName.localeCompare(progressName) == 0) {
            result = this.valueForSlowProgress(apl, treasureBudgetModifier);
        } else if (this.mediumProgressName.localeCompare(progressName) == 0) {
            result = this.valueForMediumProgress(apl, treasureBudgetModifier);
        } else if (this.fastProgressName.localeCompare(progressName) == 0) {
            result = this.valueForFastProgress(apl, treasureBudgetModifier);
        } else {
            throw new Error(progressName + " unknow progress name");
        }
        return result;
    },

    valueForSlowProgress(apl, treasureBudgetModifier = this.defaultTreasureBudgetModifier) {
        if (Number.isInteger(apl)) {
            var valueObject = treasureValuePerEncounterFile.find(valueObject => valueObject.apl == apl);
            if (valueObject != undefined) {
                return valueObject.slow * treasureBudgetModifier;
            } else {
                throw new Error("No budget found for APL " + apl);
            }
        } else {
            throw new Error("APL is not a number");
        }
    },

    valueForMediumProgress(apl, treasureBudgetModifier = this.defaultTreasureBudgetModifier) {
        if (Number.isInteger(apl)) {
            var valueObject = treasureValuePerEncounterFile.find(valueObject => valueObject.apl == apl);
            if (valueObject != undefined) {
                return valueObject.medium * treasureBudgetModifier;
            } else {
                throw new Error("No budget found for APL " + apl);
            }
        } else {
            throw new Error("APL is not a number");
        }
    },
    valueForFastProgress(apl, treasureBudgetModifier = this.defaultTreasureBudgetModifier) {
        if (Number.isInteger(apl)) {
            var valueObject = treasureValuePerEncounterFile.find(valueObject => valueObject.apl == apl);
            if (valueObject != undefined) {
                return valueObject.fast * treasureBudgetModifier;
            } else {
                throw new Error("No budget found for APL " + apl);
            }
        } else {
            throw new Error("APL is not a number");
        }
    }
};

class ArmorShieldObject extends EventEmitter {
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

const armorShield = {
    roll() {
        var table = armorShieldFile.tables[0];
        if (table != undefined) {
            const randomNumber = dices.roll100();
            var randomObject = table.find(rollObject => {
                return rollObject.minPercent <= randomNumber && randomNumber <= rollObject.maxPercent;
            });
            if (randomObject != undefined) {
                return new ArmorShieldObject(randomObject);
            } else {
                throw new Error("Roll " + randomNumber + " not found")
            }
        } else {
            throw new Error("Table not found for level " + level)
        }
    }
}

class MoneyObject extends EventEmitter {
    constructor(rollObject) {
        super();
        this.uuid = uuid();
        this.treasureObject = rollObject;
        var moneyRewardRollObject = rollObject.reward;
        var moneyRewardObject = money.roll(moneyRewardRollObject);
        this.moneyReward = money.convertToGp(moneyRewardObject);
    }

    render() {
        var result = `<tr id=\"${this.uuid}\">`
        if (this.treasureObject.minPercent != this.treasureObject.maxPercent) {
            result += `<td>
                    ${this.treasureObject.minPercent}-${this.treasureObject.maxPercent} %   
                </td>`;
        } else {
            result += `<td>
                    ${this.treasureObject.minPercent} %
                </td>`;
        }
        result += `<td>${this.moneyReward} po</td>
        </tr>`;
        return result;
    }
}

const money = {
    roll(moneyRollObject = { cpRoll: "", spRoll: "", gpRoll: "", ppRoll: "" }) {
        var result = { cp: 0, sp: 0, gp: 0, pp: 0 };

        result.cp = dices.rollDiceFormula(moneyRollObject.cpRoll);
        result.sp = dices.rollDiceFormula(moneyRollObject.spRoll);
        result.gp = dices.rollDiceFormula(moneyRollObject.gpRoll);
        result.pp = dices.rollDiceFormula(moneyRollObject.ppRoll);

        return new MoneyObject(result);
    },

    convertToGp(moneyObject = { cp: 0, sp: 0, gp: 0, pp: 0 }) {
        var total = 0;

        if (moneyObject.cp != undefined) {
            total += moneyObject.cp / 100;
        }
        if (moneyObject.sp != undefined) {
            total += moneyObject.sp / 10;
        }
        if (moneyObject.gp != undefined) {
            total += moneyObject.gp;
        }
        if (moneyObject.pp != undefined) {
            total += moneyObject.pp * 10;
        }

        return total;
    }
}

class GemObject extends EventEmitter {
    constructor(rollObject) {
        super();
        this.uuid = uuid();
        this.treasureObject = rollObject;
        this.marketValue = rollObject.baseValue;
        this.marketValue += dices.rollDiceFormula(this.treasureObject.addedValue)
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

const gem = {
    rollForGrade(grade) {
        var table = gemsFile.tables.find(tableObject => tableObject.grade == grade);
        if (table != undefined) {
            const randomNumber = dices.roll100();
            var randomObject = table.rolls.find(rollObject => {
                return rollObject.minPercent <= randomNumber && randomNumber <= rollObject.maxPercent;
            });
            if (randomObject != undefined) {
                return new GemObject(randomObject);
            } else {
                throw new Error("Roll " + randomNumber + " not found for grade " + grade)
            }
        } else {
            throw new Error("Table not found for grade " + grade)
        }
    }
}

class ArtObject extends EventEmitter {
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

const art = {
    rollForGrade(grade) {
        var table = artFile.tables.find(tableObject => tableObject.grade == grade);
        if (table != undefined) {
            const randomNumber = dices.roll100();
            var randomObject = table.rolls.find(rollObject => {
                return rollObject.minPercent <= randomNumber && randomNumber <= rollObject.maxPercent;
            });
            if (randomObject != undefined) {
                return new ArtObject(randomObject);
            } else {
                throw new Error("Roll " + randomNumber + " not found for grade " + grade)
            }
        } else {
            throw new Error("Table not found for grade " + grade)
        }
    }
}

class CompoundObject extends EventEmitter {

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

const compounds = {
    rollForLevelBudget: function (level, budget, nbTries = 10) {
        var attempts = [];

        for (var i = 0; i < nbTries; i++) {
            var totalValue = 0;
            var attempt = [];
            var currentItem = undefined;
            var currentItemValue = 0;
            do {
                if (currentItem != undefined) {
                    attempt.push(currentItem);
                }
                currentItem = this.rollForLevel(level);
                if (currentItem != undefined) {
                    currentItemValue = currentItem.marketPrice;
                }
                if (attempt.length > 0) {
                    totalValue = attempt.map(item => item.marketPrice).reduce((previous, current) => current + previous);
                }
            } while (totalValue + currentItemValue < budget)
            attempts.push(attempt);
        }

        function diffWithBudget(budget, list) {
            var sum = list.map(item => item.marketPrice).reduce((previous, current) => previous + current);
            return budget - sum;
        }

        var bestAttemptDiff = budget;
        var bestAttempt = undefined;
        attempts.forEach(attempt => {
            var attemptDiff = diffWithBudget(budget, attempt);
            if (attemptDiff < bestAttemptDiff) {
                bestAttemptDiff = attemptDiff;
                bestAttempt = attempt;
            }
        });
        return bestAttempt;
    },

    rollForLevel: function (level) {
        var table = compoundsFile.tables.find(tableObject => (tableObject.minLevel <= level && tableObject.maxLevel >= level));
        if (table != undefined) {
            const randomNumber = dices.roll100();
            var randomObject = table.rolls.find(rollObject => {
                return rollObject.minPercent <= randomNumber && randomNumber <= rollObject.maxPercent;
            });
            if (randomObject != undefined) {
                return new CompoundObject(randomObject);
            } else {
                throw new Error("Roll " + randomNumber + " not found for level " + level + " in table tier " + tableObject.tier)
            }
        } else {
            throw new Error("Table not found for level " + level)
        }
    },

    rollForTier: function (tier) {
        var table = compoundsFile.tables.find(tableObject => (tableObject.tier == tier));
        if (table != undefined) {
            const randomNumber = dices.roll100();
            var randomObject = table.rolls.find(rollObject => {
                return rollObject.minPercent <= randomNumber && randomNumber <= rollObject.maxPercent;
            });
            if (randomObject != undefined) {
                return new CompoundObject(randomObject);
            } else {
                throw new Error("Roll " + randomNumber + " not found for tier " + tier)
            }
        } else {
            throw new Error("Table not found for tier " + tier)
        }
    },
};

const typeATreasure = {
    rollForValue(value) {
        var table = typeAFile.table;
        if (table != undefined) {
            const randomNumber = dices.roll100();
            var randomObject = table.rolls.find(rollObject => {
                return rollObject.minPercent <= randomNumber && randomNumber <= rollObject.maxPercent;
            });
            if (randomObject != undefined) {
                return randomObject;
            } else {
                throw new Error("Roll " + randomNumber + " not found for tier " + tier)
            }
        } else {
            throw new Error("Table not found for tier " + tier)
        }
    }
};

const typeBTreasure = {
    rollForValue(value) {
        var table = typeBFile.table;
        if (table != undefined) {
            const randomNumber = dices.roll100();
            var randomObject = table.rolls.find(rollObject => {
                return rollObject.minPercent <= randomNumber && randomNumber <= rollObject.maxPercent;
            });
            if (randomObject != undefined) {
                return randomObject;
            } else {
                throw new Error("Roll " + randomNumber + " not found for tier " + tier)
            }
        } else {
            throw new Error("Table not found for tier " + tier)
        }
    }
};

$(() => {
    var contentDiv = $("#mainContentCol");

    var treasureBudgetModifier = Number.parseFloat($("#budgetModifierSelect").val());
    var apl = Number.parseInt($("#aplField").val());
    var progression = $("#budgetProgressionSelect").val();
    var budget = treasureValuePerEncounter.valueForProgress(progression, apl, treasureBudgetModifier);
    $("#budget").empty();
    $("#budget").append(budget + "po");
    $("#aplField").on("change", () => {
        var apl = Number.parseInt($("#aplField").val());
        var treasureBudgetModifier = Number.parseFloat($("#budgetModifierSelect").val());
        var progression = $("#budgetProgressionSelect").val();
        var budget = treasureValuePerEncounter.valueForProgress(progression, apl, treasureBudgetModifier);
        $("#budget").empty();
        $("#budget").append(budget + "po");
    })
    $("#budgetModifierSelect").on("change", () => {
        var apl = Number.parseInt($("#aplField").val());
        var treasureBudgetModifier = Number.parseFloat($("#budgetModifierSelect").val());
        var progression = $("#budgetProgressionSelect").val();
        var budget = treasureValuePerEncounter.valueForProgress(progression, apl, treasureBudgetModifier);
        $("#budget").empty();
        $("#budget").append(budget + "po");
    })
    $("#budgetProgressionSelect").on("change", () => {
        var apl = Number.parseInt($("#aplField").val());
        var treasureBudgetModifier = Number.parseFloat($("#budgetModifierSelect").val());
        var progression = $("#budgetProgressionSelect").val();
        var budget = treasureValuePerEncounter.valueForProgress(progression, apl, treasureBudgetModifier);
        $("#budget").empty();
        $("#budget").append(budget + "po");
    })

    var compoundsGroupDiv = $(document.createElement('div'));
    compoundsGroupDiv.addClass("row");
    var compoundsGroupCol = $(document.createElement('div'));
    compoundsGroupCol.addClass("col-12");
    compoundsGroupDiv.append(compoundsGroupCol);

    function createRandomCompoundDivForTier(tier) {
        var randomCompoundsTierDiv = $(document.createElement('div'));
        randomCompoundsTierDiv.addClass("row");
        var randomCompoundsTierButton = $(document.createElement('a'));
        randomCompoundsTierButton.addClass("btn");
        randomCompoundsTierButton.text("Random tier " + tier + " compounds")
        var randomCompoundsTierItemTable = new ItemTable();
        randomCompoundsTierButton.on("click", event => {
            var randomObject = compounds.rollForTier(tier);
            if (randomObject != undefined) {
                randomCompoundsTierItemTable.addItem(randomObject, compounds.convertRollObjectToTableLine);
            }
        });
        randomCompoundsTierDiv.append(randomCompoundsTierButton)
        randomCompoundsTierDiv.append(randomCompoundsTierItemTable.render())
        randomCompoundsTierItemTable.on("change", event => {
            $("#" + randomCompoundsTierItemTable.uuid).remove();
            randomCompoundsTierDiv.append(randomCompoundsTierItemTable.render());
        })
        compoundsGroupDiv.append(randomCompoundsTierDiv);
    }
    createRandomCompoundDivForTier(1)
    createRandomCompoundDivForTier(2)
    createRandomCompoundDivForTier(3)
    createRandomCompoundDivForTier(4)

    var generateCompoundsDiv = $(document.createElement('div'));
    generateCompoundsDiv.addClass("row");
    var generateCompoundsSettingsCol = $(document.createElement('div'));
    generateCompoundsSettingsCol.addClass("col-6");
    var generateCompoundsLevelBudgetButton = $(document.createElement('a'));
    generateCompoundsLevelBudgetButton.addClass("btn");
    generateCompoundsLevelBudgetButton.text("List of compounds for this budget");
    generateCompoundsLevelBudgetButton.prop("id", "generateCoumpoundsLevelBudget")
    var inputLevel = $(document.createElement('input'));
    inputLevel.attr("type", "number");
    inputLevel.attr("min", "1");
    inputLevel.attr("max", "20");
    inputLevel.attr("value", "1");
    inputLevel.prop("id", "generateCoumpoundsLevel")
    var inputBudget = $(document.createElement('input'));
    inputBudget.attr("type", "number");
    inputBudget.attr("min", "0");
    inputBudget.attr("value", "1000");
    inputBudget.prop("id", "generateCoumpoundsBudget")
    var budgetTextLabel = $(document.createElement('p'));
    budgetTextLabel.text("Budget: ");
    generateCompoundsSettingsCol.append(budgetTextLabel);
    generateCompoundsSettingsCol.append(inputBudget);
    var levelTextLabel = $(document.createElement('p'));
    levelTextLabel.text("Level: ");
    generateCompoundsSettingsCol.append(levelTextLabel);
    generateCompoundsSettingsCol.append(inputLevel);
    generateCompoundsSettingsCol.append(generateCompoundsLevelBudgetButton);
    var generateCompoundsResultsCol = $(document.createElement('div'));
    generateCompoundsResultsCol.addClass("col-6");
    var generateCompoundsResults = new ItemTable();
    generateCompoundsLevelBudgetButton.on("click", event => {
        generateCompoundsResults.clear();
        const level = Number.parseInt($("#generateCoumpoundsLevel").val());
        const budget = Number.parseInt($("#generateCoumpoundsBudget").val());
        compounds.rollForLevelBudget(level, budget).forEach(item => {
            generateCompoundsResults.addItem(item);
        })
    });
    generateCompoundsResultsCol.append(generateCompoundsResults.render());
    generateCompoundsResults.on("change", event => {
        $("#" + generateCompoundsResults.uuid).remove();
        generateCompoundsResultsCol.append(generateCompoundsResults.render());
    })
    generateCompoundsDiv.append(generateCompoundsSettingsCol);
    generateCompoundsDiv.append(generateCompoundsResultsCol);
    compoundsGroupDiv.append(generateCompoundsDiv);

    var randomArmorShieldDiv = $(document.createElement('div'));
    randomArmorShieldDiv.addClass("row")
    var randomArmorShieldButton = $(document.createElement('a'));
    randomArmorShieldButton.addClass("btn");
    randomArmorShieldButton.text("Random armor/shield")
    var randomArmorShieldItemTable = new ItemTable();
    randomArmorShieldButton.on("click", event => {
        var randomObject = armorShield.roll();
        console.log(randomObject)
        if (randomObject != undefined) {
            randomArmorShieldItemTable.addItem(randomObject);
        }
    });
    randomArmorShieldDiv.append(randomArmorShieldButton)
    randomArmorShieldDiv.append(randomArmorShieldItemTable.render())
    randomArmorShieldItemTable.on("change", event => {
        $("#" + randomArmorShieldItemTable.uuid).remove();
        randomArmorShieldDiv.append(randomArmorShieldItemTable.render());
    })

    var randomGemDiv = $(document.createElement('div'));
    randomGemDiv.addClass("row")
    var randomGemButton = $(document.createElement('a'));
    randomGemButton.addClass("btn");
    randomGemButton.text("Random Gem")
    var randomGemItemTable = new ItemTable();
    randomGemButton.on("click", event => {
        var randomObject = gem.rollForGrade(dices.roll(6));
        console.log(randomObject)
        if (randomObject != undefined) {
            randomGemItemTable.addItem(randomObject, gem.convertRollObjectToTableLine);
        }
    });
    randomGemDiv.append(randomGemButton)
    randomGemDiv.append(randomGemItemTable.render())
    randomGemItemTable.on("change", event => {
        $("#" + randomGemItemTable.uuid).remove();
        randomGemDiv.append(randomGemItemTable.render());
    })

    var randomArtDiv = $(document.createElement('div'));
    randomArtDiv.addClass("row")
    var randomArtButton = $(document.createElement('a'));
    randomArtButton.addClass("btn");
    randomArtButton.text("Random Art")
    var randomArtItemTable = new ItemTable();
    randomArtButton.on("click", event => {
        var randomObject = art.rollForGrade(dices.roll(6));
        console.log(randomObject)
        if (randomObject != undefined) {
            randomArtItemTable.addItem(randomObject, art.convertRollObjectToTableLine);
        }
    });
    randomArtDiv.append(randomArtButton)
    randomArtDiv.append(randomArtItemTable.render())
    randomArtItemTable.on("change", event => {
        $("#" + randomArtItemTable.uuid).remove();
        randomArtDiv.append(randomArtItemTable.render());
    })

    contentDiv.append(compoundsGroupDiv);
    contentDiv.append(randomArmorShieldDiv);
    contentDiv.append(randomGemDiv);
    contentDiv.append(randomArtDiv);
})