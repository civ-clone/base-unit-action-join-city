import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import City from '@civ-clone/core-city/City';
/**
 * Whether `city` is too large for a unit to join it: its size has reached `limit`. A ruleset's `CanJoinCity` rule
 * refuses such a city, and a renderer can say why with the same check.
 */
export declare const tooLargeToJoin: (
  limit: number
) => (city: City, cityGrowthRegistry?: CityGrowthRegistry) => boolean;
export default tooLargeToJoin;
