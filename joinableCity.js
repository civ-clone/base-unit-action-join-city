"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinableCity = void 0;
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const CanJoinCity_1 = require("./Rules/CanJoinCity");
/**
 * The `City` on `tile` that `unit` can join, or `null`: one of the unit's player's cities, which every applicable
 * `CanJoinCity` rule allows. Which units may join at all is for the rule that offers `JoinCity` to decide.
 */
const joinableCity = (unit, tile = unit.tile(), cityRegistry = CityRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => {
    const city = cityRegistry.getByTile(tile);
    if (city === null || city.player() !== unit.player()) {
        return null;
    }
    if (!ruleRegistry
        .process(CanJoinCity_1.default, unit, city)
        .every((canJoin) => canJoin)) {
        return null;
    }
    return city;
};
exports.joinableCity = joinableCity;
exports.default = exports.joinableCity;
//# sourceMappingURL=joinableCity.js.map