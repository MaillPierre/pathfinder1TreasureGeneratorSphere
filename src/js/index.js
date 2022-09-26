import $ from 'jquery';
import * as EventEmitter from 'events';

import compoundsFile from "../../data/compounds.json";// assert { type: `json` };

function rollObjectToHtml(rollObject) {
    var rollObjectText = $(document.createElement('p'));
    var itemLink = $(document.createElement('a'));
    itemLink.prop("href", rollObject.url);
    rollObjectText.append(rollObject.minPercent + "-" + rollObject.maxPercent + "% ");
    itemLink.text(rollObject.item)
    rollObjectText.append(itemLink)
    rollObjectText.append(" Price:" + rollObject.marketPrice)

    return rollObjectText;
}

function roll(intMax) {

    return Math.floor(Math.random() * intMax) +1 ;
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

                var tableList = $(document.createElement('ul'));
                tableObject.rolls.forEach(rollObject => {
                    console.log(rollObject)
                    var tableListItem = $(document.createElement('li'));

                    var rollObjectText = rollObjectToHtml(rollObject);

                    tableListItem.append(rollObjectText)
                    tableList.append(tableListItem);
                });

                var randomDiv = $(document.createElement('div'));
                randomDiv.addClass("row")
                var randomButton = $(document.createElement('a'));
                randomButton.addClass("btn");
                randomButton.text("RANDOM")
                var randomText = $(document.createElement('p'));
                randomButton.on("click", event => {
                    var randomObject = this.rollForTier(tableObject.tier);
                    if (randomObject != undefined) {
                        randomText.append(rollObjectToHtml(randomObject));
                    }
                });
                randomDiv.append(randomButton)
                randomDiv.append(randomText)

                compoundsTablesCol.append(tableList);
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