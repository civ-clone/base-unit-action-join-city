import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import CanJoinCity from './Rules/CanJoinCity';
import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * The `City` on `tile` that `unit` can join, or `null`: one of the unit's player's cities, which every applicable
 * `CanJoinCity` rule allows. Which units may join at all is for the rule that offers `JoinCity` to decide.
 */
export const joinableCity = (
  unit: Unit,
  tile: Tile = unit.tile(),
  cityRegistry: CityRegistry = cityRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): City | null => {
  const city = cityRegistry.getByTile(tile);

  if (city === null || city.player() !== unit.player()) {
    return null;
  }

  if (
    !ruleRegistry
      .process(CanJoinCity, unit, city)
      .every((canJoin: boolean): boolean => canJoin)
  ) {
    return null;
  }

  return city;
};

export default joinableCity;
