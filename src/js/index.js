import $ from 'jquery';
import * as EventEmitter from 'events';

import compoundsFile from "../../data/compounds.json";// assert { type: `json` };

function roll(intMax) {

    return Math.floor(Math.random() * intMax) + 1;
}

function roll4() {
    return roll(4);
}

function roll6() {
    return roll(6);
}

function roll8() {
    return roll(8);
}

function roll10() {
    return roll(10);
}

function roll12() {
    return roll(12);
}

function roll20() {
    return roll(20);
}

function roll100() {
    return roll(100);
}

class ItemTable {

    constructor(itemArray) {
        this.tableDiv =  $(document.createElement('table'));
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

        if(itemArray != undefined) {
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

$(() => {

    console.log(JSON.stringify(compoundsFile));
    var contentDiv = $("#mainContentCol");

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
                const randomNumber = roll100();
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
                const randomNumber = roll100();
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
    }


    contentDiv.append(compounds.toHtml())
})