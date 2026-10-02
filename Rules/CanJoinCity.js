"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanJoinCity = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * Whether `Unit` may join `City`. A unit may join only when every one of these that applies returns `true`, so a
 * ruleset limits joining by adding them (Civilization: only a city under size 10). With none registered, a unit may
 * join any of its player's cities.
 */
class CanJoinCity extends Rule_1.default {
}
exports.CanJoinCity = CanJoinCity;
exports.default = CanJoinCity;
//# sourceMappingURL=CanJoinCity.js.map