import $ from 'jquery';
import * as Rolls from './Rolls.js';
import { ItemTable } from './Objects.js';

// http://spheresofpower.wikidot.com/loot-tables



$(() => {
    var contentDiv = $("#mainContentCol");

    var treasureBudgetModifier = Number.parseFloat($("#budgetModifierSelect").val());
    var apl = Number.parseInt($("#aplField").val());
    var progression = $("#budgetProgressionSelect").val();
    var budget = Rolls.treasureValuePerEncounter.valueForProgress(progression, apl, treasureBudgetModifier);
    $("#budget").empty();
    $("#budget").append(budget + "po");
    $("#aplField").on("change", () => {
        var apl = Number.parseInt($("#aplField").val());
        var treasureBudgetModifier = Number.parseFloat($("#budgetModifierSelect").val());
        var progression = $("#budgetProgressionSelect").val();
        var budget = Rolls.treasureValuePerEncounter.valueForProgress(progression, apl, treasureBudgetModifier);
        $("#budget").empty();
        $("#budget").append(budget + "po");
    })
    $("#budgetModifierSelect").on("change", () => {
        var apl = Number.parseInt($("#aplField").val());
        var treasureBudgetModifier = Number.parseFloat($("#budgetModifierSelect").val());
        var progression = $("#budgetProgressionSelect").val();
        var budget = Rolls.treasureValuePerEncounter.valueForProgress(progression, apl, treasureBudgetModifier);
        $("#budget").empty();
        $("#budget").append(budget + "po");
    })
    $("#budgetProgressionSelect").on("change", () => {
        var apl = Number.parseInt($("#aplField").val());
        var treasureBudgetModifier = Number.parseFloat($("#budgetModifierSelect").val());
        var progression = $("#budgetProgressionSelect").val();
        var budget = Rolls.treasureValuePerEncounter.valueForProgress(progression, apl, treasureBudgetModifier);
        $("#budget").empty();
        $("#budget").append(budget + "po");
    })

    var randomTreasureADiv = $(document.createElement('div'));
    randomTreasureADiv.addClass("row")
    var randomTreasureAButton = $(document.createElement('a'));
    randomTreasureAButton.addClass("btn");
    randomTreasureAButton.text("Random Type A treasure")
    var randomTreasureAItemTable = new ItemTable();
    randomTreasureAButton.on("click", event => {
        var randomObjects = Rolls.typeATreasure.roll( {budget: budget});
        var sumObject = randomObjects.reduce((sum, current) => {
            if (sum == undefined) {
                return current;
            }
            return sum.addition(current);
        });
        
        if (sumObject != undefined) {
            randomTreasureAItemTable.addItem(sumObject);
        }
    });
    randomTreasureADiv.append(randomTreasureAButton)
    randomTreasureADiv.append(randomTreasureAItemTable.render())
    randomTreasureAItemTable.on("change", event => {
        $("#" + randomTreasureAItemTable.uuid).remove();
        randomTreasureADiv.append(randomTreasureAItemTable.render());
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
            var randomObject = Rolls.compounds.rollForTier(tier);
            if (randomObject != undefined) {
                randomCompoundsTierItemTable.addItem(randomObject, Rolls.compounds.convertRollObjectToTableLine);
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
        Rolls.compounds.rollForLevelBudget(level, budget).forEach(item => {
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
        var randomObject = Rolls.armorShield.roll();
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
        var randomObject = Rolls.gem.rollForGrade( Rolls.dices.roll(6));
        
        if (randomObject != undefined) {
            randomGemItemTable.addItem(randomObject, Rolls.gem.convertRollObjectToTableLine);
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
        var randomObject = Rolls.art.rollForGrade( Rolls.dices.roll(6));
        if (randomObject != undefined) {
            randomArtItemTable.addItem(randomObject, Rolls.art.convertRollObjectToTableLine);
        }
    });
    randomArtDiv.append(randomArtButton)
    randomArtDiv.append(randomArtItemTable.render())
    randomArtItemTable.on("change", event => {
        $("#" + randomArtItemTable.uuid).remove();
        randomArtDiv.append(randomArtItemTable.render());
    })

    contentDiv.append(randomTreasureADiv);
    contentDiv.append(compoundsGroupDiv);
    contentDiv.append(randomArmorShieldDiv);
    contentDiv.append(randomGemDiv);
    contentDiv.append(randomArtDiv);
})