"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinCity = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Action_1 = require("@civ-clone/core-unit/Action");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
class JoinCity extends Action_1.default {
    constructor(from, to, unit, city, ruleRegistry = RuleRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance) {
        super(from, to, unit, ruleRegistry);
        this._city = city;
        this._cityGrowthRegistry = cityGrowthRegistry;
    }
    perform() {
        const cityGrowth = this._cityGrowthRegistry.getByCity(this._city), storedFood = cityGrowth.progress().value();
        // Grown through `CityGrowth`, so the ruleset's `Grow` rules give the new citizen a tile (or make it a specialist)
        // and set the cost of the next size.
        cityGrowth.grow();
        // Those rules also empty the food box (or, with a Granary, half-fill it), which is what growing from food costs. A
        // citizen who arrives with a unit costs the city no food, so it keeps what it had stored, as in Civilization, where
        // the size goes up by one and nothing else changes.
        cityGrowth.progress().set(storedFood, 'join-city');
        this.unit().destroy();
        this.ruleRegistry().process(Moved_1.default, this.unit(), this);
    }
}
exports.JoinCity = JoinCity;
exports.default = JoinCity;
//# sourceMappingURL=JoinCity.js.map