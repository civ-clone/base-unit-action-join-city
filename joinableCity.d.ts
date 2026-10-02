import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * The `City` on `tile` that `unit` can join, or `null`: one of the unit's player's cities, which every applicable
 * `CanJoinCity` rule allows. Which units may join at all is for the rule that offers `JoinCity` to decide.
 */
export declare const joinableCity: (
  unit: Unit,
  tile?: Tile,
  cityRegistry?: CityRegistry,
  ruleRegistry?: RuleRegistry
) => City | null;
export default joinableCity;
