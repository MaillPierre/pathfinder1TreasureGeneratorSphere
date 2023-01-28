import { GemObject, ArmorShieldObject, ArtObject, CompoundObject, MoneyObject } from "./Objects";


import compoundsFile from "../../data/compounds.json";
import gemsFile from "../../data/gems.json";
import artFile from "../../data/art.json";
import treasureValuePerEncounterFile from "../../data/treasureValuePerEncounter.json";
import armorShieldFile from "../../data/armorShield.json";

import typeAFile from "../../data/typeA.json";
import typeBFile from "../../data/typeB.json";
import typeCFile from "../../data/typeC.json";

var treasureObject = {
    gems: gemsFile,
    art: artFile,
    compounds: compoundsFile,
    armorShield: armorShieldFile,
    typeA: typeAFile,
}

export const dices = {
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

export const treasureValuePerEncounter = {
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

export const money = {
    roll(moneyRollObject = { cpRoll: "", spRoll: "", gpRoll: "", ppRoll: "" }) {
        var result = { cp: 0, sp: 0, gp: 0, pp: 0 };

        result.cp = dices.rollDiceFormula(moneyRollObject.cpRoll);
        result.sp = dices.rollDiceFormula(moneyRollObject.spRoll);
        result.gp = dices.rollDiceFormula(moneyRollObject.gpRoll);
        result.pp = dices.rollDiceFormula(moneyRollObject.ppRoll);
        if(result.cp == false) {
            result.cp = 0;
        }
        if(result.sp == false) {
            result.sp = 0;
        }
        if(result.gp == false) {
            result.gp = 0;
        }
        if(result.pp == false) {
            result.pp = 0;
        }

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

export const armorShield = {
    roll() {
        var table = treasureObject.armorShield.tables[0];
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

export const gem = {
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

export const art = {
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

export const compounds = {
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

export const typeATreasure = {
    roll ( config = {budget }, nbTries= 10) {
            var attempts = [];
            var table = treasureObject.typeA.table;
            table.sort((a, b) => b.value - a.value);
    
            for (var i = 0; i < nbTries; i++) {
                var totalValue = 0;
                var attempt = [];
                var currentItem = undefined;
                var currentItemValue = 0;
                do {
                    currentItem = table.find(item => item.value <= config.budget - totalValue )
                    if (currentItem != undefined) {
                        currentItemValue = currentItem.value;
                        attempt.push(currentItem);
                        totalValue = attempt.map(item => item.value).reduce((previous, current) => current + previous);
                    }
                } while (totalValue < config.budget)
                attempts.push(attempt);
            }
    
            function diffWithBudget(budget, attempt) {
                var sum = attempt.map(item => item.value).reduce((previous, current) => previous + current);
                return budget - sum;
            }
            
            var bestAttemptDiff = config.budget;
            var bestAttempt = [];
            attempts.forEach(attempt => {
                var attemptDiff = diffWithBudget(config.budget, attempt);
                if (attemptDiff <= bestAttemptDiff) {
                    bestAttemptDiff = attemptDiff;
                    bestAttempt = attempt;
                }
            });

            return bestAttempt.map(item => money.roll(item.reward.money));
        }
}