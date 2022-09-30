import $ from 'jquery';
import * as EventEmitter from 'events';

import compoundsFile from "../../data/compounds.json";
import gemsFile from "../../data/gems.json";
import treasureValuePerEncounterFile from "../../data/treasureValuePerEncounter.json";
import armorShieldFile from "../../data/armorShield.json";

const dices = {
    roll: function (intMax) {
        return Math.floor(Math.random() * intMax) + 1;
    },

    rollDice: function (rollString) {
        /* function to parse and calculate dice roll formulas.
        *  like 3d6 + 2d10 = 3 rolls of 6 sided dice + 2 rolls of 10 sided
        *  Return one number, or array of numbers if rolls > 1
        *  By @BitOfGold
        */
        function roll(formula, rolls = 1) {
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

class ItemTable {

    constructor(itemArray) {
        this.tableDiv = $(document.createElement('table'));
        this.tableDiv.addClass("table")
        var tableHeader = $(document.createElement('thead'));
        this.tableDiv.append(tableHeader);
        var tableHeaderLine = $(document.createElement('tr'));
        tableHeader.append(tableHeaderLine);
        var tableHeaderPercentCell = $(document.createElement('th'));
        tableHeaderPercentCell.attr("scope", "col");
        tableHeaderPercentCell.append("Roll");
        tableHeaderLine.append(tableHeaderPercentCell);
        var tableHeaderItemCell = $(document.createElement('th'));
        tableHeaderItemCell.attr("scope", "col");
        tableHeaderItemCell.append("Item")
        tableHeaderLine.append(tableHeaderItemCell);
        var tableHeaderPriceCell = $(document.createElement('th'));
        tableHeaderPriceCell.attr("scope", "col");
        tableHeaderPriceCell.append("Price")
        tableHeaderLine.append(tableHeaderPriceCell);
        this.tableBody = $(document.createElement('tbody'));
        this.tableDiv.append(this.tableBody)

        if (itemArray != undefined) {
            itemArray.forEach(rollObject => {
                this.addItem(rollObject);

            });
        }
    }

    getHtml() {
        return this.tableDiv;
    }

    addItem(rollObject) {
        var rollObjectLine = this.convertRollObjectToTableLine(rollObject);
        this.tableBody.append(rollObjectLine);
    }


    convertRollObjectToTableLine = function (rollObject) {
        var rollObjectTr = $(document.createElement('tr'));
        var rollObjectPercentsTd = $(document.createElement('td'));
        var rollObjectLinkTd = $(document.createElement('td'));
        var rollObjectPriceTd = $(document.createElement('td'));
        var itemLink = $(document.createElement('a'));
        itemLink.prop("href", rollObject.url);
        itemLink.text(rollObject.item)
        if (rollObject.minPercent != rollObject.maxPercent) {
            rollObjectPercentsTd.append(rollObject.minPercent + "-" + rollObject.maxPercent);
        } else {
            rollObjectPercentsTd.append(rollObject.minPercent);
        }
        rollObjectLinkTd.append(itemLink);
        rollObjectPriceTd.append(rollObject.marketPrice + " po");

        rollObjectTr.append(rollObjectPercentsTd);
        rollObjectTr.append(rollObjectLinkTd);
        rollObjectTr.append(rollObjectPriceTd);

        return rollObjectTr;
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

const armorShield = {
    toHtml() {
        // Title and description
        var catDiv = $(document.createElement('div'));
        catDiv.addClass('row');
        var catCol = $(document.createElement('div'));
        catDiv.addClass('col');
        catDiv.append(catCol);
        var catTitleDiv = $(document.createElement('div'));
        catTitleDiv.addClass('row')
        var catTitle = $(document.createElement('h1'));
        catTitle.text(armorShieldFile.title);
        catTitleDiv.append(catTitle)
        var catDescDiv = $(document.createElement('div'));
        catDescDiv.addClass('row')
        var catDesc = $(document.createElement('p'));
        catDesc.text(armorShieldFile.description);
        catDescDiv.append(catDesc)

        var catTablesDiv = $(document.createElement('div'));
        catTablesDiv.addClass('row')
        var catTablesCol = $(document.createElement('div'));
        catTablesCol.addClass('col')
        catTablesDiv.append(catTablesCol);
        // Tables
        armorShieldFile.tables.forEach(tableObject => {

            var itemTable = new ItemTable(tableObject);
            var tableHtml = itemTable.getHtml();

            var randomDiv = $(document.createElement('div'));
            randomDiv.addClass("row")
            var randomButton = $(document.createElement('a'));
            randomButton.addClass("btn");
            randomButton.text("RANDOM")
            var randomItemTable = new ItemTable();
            var randomTable = randomItemTable.getHtml();
            randomButton.on("click", event => {
                var randomObject = this.roll();
                if (randomObject != undefined) {
                    randomItemTable.addItem(randomObject);
                }
            });
            randomDiv.append(randomButton)
            randomDiv.append(randomTable)

            catTablesCol.append(tableHtml);
            catTablesCol.append(randomDiv);
        });


        catCol.append(catTitleDiv);
        catCol.append(catDescDiv);
        catCol.append(catTablesDiv);

        return catDiv;
    },

    roll() {
        var table = armorShieldFile.tables[0];
        if (table != undefined) {
            const randomNumber = dices.roll100();
            var randomObject = table.find(rollObject => {
                return rollObject.minPercent <= randomNumber && randomNumber <= rollObject.maxPercent;
            });
            if (randomObject != undefined) {
                return randomObject;
            } else {
                throw new Error("Roll " + randomNumber + " not found")
            }
        } else {
            throw new Error("Table not found for level " + level)
        }
    }
}

const money = {
    roll(moneyRollObject = { pcRoll: "", paRoll: "", poRoll: "", ppRoll: "" }) {
        var result = { pc: 0, pa: 0, po: 0, pp: 0 };

        result.pc = dices.rollDice(moneyRollObject.pcRoll);
        result.pa = dices.rollDice(moneyRollObject.paRoll);
        result.po = dices.rollDice(moneyRollObject.poRoll);
        result.pp = dices.rollDice(moneyRollObject.ppRoll);

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
                return randomObject;
            } else {
                throw new Error("Roll " + randomNumber + " not found for grade " + grade )
            }
        } else {
            throw new Error("Table not found for grade " + grade)
        }
    }
}

const compounds = {
    toHtml: function () {

        // Title and description
        var compoundsDiv = $(document.createElement('div'));
        compoundsDiv.addClass('row');
        var compoundsCol = $(document.createElement('div'));
        compoundsDiv.addClass('col');
        compoundsDiv.append(compoundsCol);
        var compoundsTitleDiv = $(document.createElement('div'));
        compoundsTitleDiv.addClass('row')
        var compoundsTitle = $(document.createElement('h1'));
        compoundsTitle.text(compoundsFile.title);
        compoundsTitleDiv.append(compoundsTitle)
        var compoundsDescDiv = $(document.createElement('div'));
        compoundsDescDiv.addClass('row')
        var compoundsDesc = $(document.createElement('p'));
        compoundsDesc.text(compoundsFile.description);
        compoundsDescDiv.append(compoundsDesc)

        var compoundsTablesDiv = $(document.createElement('div'));
        compoundsTablesDiv.addClass('row')
        var compoundsTablesCol = $(document.createElement('div'));
        compoundsTablesCol.addClass('col')
        compoundsTablesDiv.append(compoundsTablesCol);
        // Tables
        compoundsFile.tables.forEach(tableObject => {
            var tableTitle = $(document.createElement('h4'));
            tableTitle.text("Tier " + tableObject.tier + " Min:" + tableObject.minLevel + " Max:" + tableObject.maxLevel);
            compoundsTablesCol.append(tableTitle);

            var itemTable = new ItemTable(tableObject.rolls);
            var tableHtml = itemTable.getHtml();

            var randomDiv = $(document.createElement('div'));
            randomDiv.addClass("row")
            var randomButton = $(document.createElement('a'));
            randomButton.addClass("btn");
            randomButton.text("RANDOM")
            var randomItemTable = new ItemTable();
            var randomTable = randomItemTable.getHtml();
            randomButton.on("click", event => {
                var randomObject = this.rollForTier(tableObject.tier);
                if (randomObject != undefined) {
                    randomItemTable.addItem(randomObject);
                }
            });
            randomDiv.append(randomButton)
            randomDiv.append(randomTable)

            compoundsTablesCol.append(tableHtml);
            compoundsTablesCol.append(randomDiv);
        });


        compoundsCol.append(compoundsTitleDiv);
        compoundsCol.append(compoundsDescDiv);
        compoundsCol.append(compoundsTablesDiv);

        return compoundsDiv;
    },

    rollForLevel: function (level) {
        var table = compoundsFile.tables.find(tableObject => (tableObject.minLevel >= level && tableObject <= level));
        if (table != undefined) {
            const randomNumber = dices.roll100();
            var randomObject = table.rolls.find(rollObject => {
                return rollObject.minPercent <= randomNumber && randomNumber <= rollObject.maxPercent;
            });
            if (randomObject != undefined) {
                return randomObject;
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

    console.log(JSON.stringify(armorShieldFile));
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

    console.log(gem.rollForGrade(1))
    console.log(gem.rollForGrade(2))
    console.log(gem.rollForGrade(3))
    console.log(gem.rollForGrade(4))
    console.log(gem.rollForGrade(5))
    console.log(gem.rollForGrade(6))

    contentDiv.append(armorShield.toHtml())
    contentDiv.append(compounds.toHtml())
})