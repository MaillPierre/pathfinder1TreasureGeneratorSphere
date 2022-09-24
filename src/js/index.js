import $ from 'jquery';
import * as EventEmitter from 'events';

import compounds from "../../data/potions.json";// assert { type: `json` };

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

$(() => {

    console.log(JSON.stringify(compounds));
    var contentDiv = $("#mainContentCol");

    // Title and description
    var compoundsDiv = $(document.createElement('div'));
    compoundsDiv.addClass('row');
    var compoundsCol = $(document.createElement('div'));
    compoundsDiv.addClass('col');
    compoundsDiv.append(compoundsCol);
    var compoundsTitleDiv = $(document.createElement('div'));
    compoundsTitleDiv.addClass('row')
    var compoundsTitle = $(document.createElement('h1'));
    compoundsTitle.text(compounds.title);
    compoundsTitleDiv.append(compoundsTitle)
    var compoundsDescDiv = $(document.createElement('div'));
    compoundsDescDiv.addClass('row')
    var compoundsDesc = $(document.createElement('p'));
    compoundsDesc.text(compounds.description);
    compoundsDescDiv.append(compoundsDesc)

    var compoundsTablesDiv = $(document.createElement('div'));
    compoundsTablesDiv.addClass('row')
    var compoundsTablesCol = $(document.createElement('div'));
    compoundsTablesCol.addClass('col')
    compoundsTablesDiv.append(compoundsTablesCol);
    // Tables
    compounds.tables.forEach(tableObject => {
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
            var randomNumber = Math.floor(Math.random()*100 + 1);
            var randomObject = tableObject.rolls.find(rollObject => {
                return rollObject.minPercent <= randomNumber && randomNumber <= rollObject.maxPercent;
            });
            randomText.append(randomNumber + " ")
            if(randomObject != undefined) {
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

    contentDiv.append(compoundsDiv)
})