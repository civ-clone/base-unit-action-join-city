"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tooLargeToJoin = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
/**
 * Whether `city` is too large for a unit to join it: its size has reached `limit`. A ruleset's `CanJoinCity` rule
 * refuses such a city, and a renderer can say why with the same check.
 */
const tooLargeToJoin = (limit) => (city, cityGrowthRegistry = CityGrowthRegistry_1.instance) => cityGrowthRegistry.getByCity(city).size() >= limit;
exports.tooLargeToJoin = tooLargeToJoin;
exports.default = exports.tooLargeToJoin;
//# sourceMappingURL=sizeLimit.js.map