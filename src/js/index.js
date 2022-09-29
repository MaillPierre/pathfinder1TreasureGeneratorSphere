import $ from 'jquery';
import * as EventEmitter from 'events';

import compoundsFile from "../../data/compounds.json";
import treasureValuePerEncounterFile from "../../data/treasureValuePerEncounter.json";
import armorShieldFile from "../../data/armorShield.json";

const dices = {
    roll: function(intMax) {
        return Math.floor(Math.random() * intMax) + 1;
    },
    
    rollDice: function(rollString) {
        const rollStringCleaned = rollString.trim().toLowerCase();
        const theD = rollStringCleaned.lastIndexOf("d");
        var result = [];
        if(theD > -1) {
            var numberOfDice = Number.parseInt(rollStringCleaned.substring(0, theD)); 
            console.log(rollStringCleaned.substring(0, theD))
            var diceNumber = Number.parseInt(rollStringCleaned.substring(theD+1)); 
            console.log(rollStringCleaned.substring(theD))
            console.log(numberOfDice)
            console.log(diceNumber)
            for(var i = 0; i < numberOfDice; i++) {
                result.push(roll(diceNumber));
            }
        } else {
            throw new Error("Dice roll format unknown " + rollString);
        }
        return result;
    },
    
    roll100: function() {
        return roll(100);
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
    valueForSlowProgress(apl, treasureBudgetModifier = 1) {
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

    valueForMediumProgress(apl, treasureBudgetModifier = 1) {
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
    valueForFastProgress(apl, treasureBudgetModifier = 1) {
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
    var budgetSlow = treasureValuePerEncounter.valueForSlowProgress(apl, treasureBudgetModifier);
    var budgetMedium = treasureValuePerEncounter.valueForMediumProgress(apl, treasureBudgetModifier);
    var budgetFast = treasureValuePerEncounter.valueForFastProgress(apl, treasureBudgetModifier);
    $("#budget").empty();
    $("#budget").append("Slow: ", budgetSlow, " Medium: ", budgetMedium, " Fast: ", budgetFast);
    $("#aplField").on("change", () => {
        var apl = Number.parseInt($("#aplField").val());
        budgetSlow = treasureValuePerEncounter.valueForSlowProgress(apl, treasureBudgetModifier);
        budgetMedium = treasureValuePerEncounter.valueForMediumProgress(apl, treasureBudgetModifier);
        budgetFast = treasureValuePerEncounter.valueForFastProgress(apl, treasureBudgetModifier);
        $("#budget").empty();
        $("#budget").append("Slow: ", budgetSlow, " Medium: ", budgetMedium, " Fast: ", budgetFast);
    })
    $("#budgetModifierSelect").on("change", () => {
        var apl = Number.parseInt($("#aplField").val());
        treasureBudgetModifier = Number.parseFloat($("#budgetModifierSelect").val());
        budgetSlow = treasureValuePerEncounter.valueForSlowProgress(apl, treasureBudgetModifier);
        budgetMedium = treasureValuePerEncounter.valueForMediumProgress(apl, treasureBudgetModifier);
        budgetFast = treasureValuePerEncounter.valueForFastProgress(apl, treasureBudgetModifier);
        $("#budget").empty();
        $("#budget").append("Slow: ", budgetSlow, " Medium: ", budgetMedium, " Fast: ", budgetFast);
    })

    contentDiv.append(armorShield.toHtml())
    contentDiv.append(compounds.toHtml())
})