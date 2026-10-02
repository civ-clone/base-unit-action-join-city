import City from '@civ-clone/core-city/City';
import Rule from '@civ-clone/core-rule/Rule';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * Whether `Unit` may join `City`. A unit may join only when every one of these that applies returns `true`, so a
 * ruleset limits joining by adding them (Civilization: only a city under size 10). With none registered, a unit may
 * join any of its player's cities.
 */
export class CanJoinCity extends Rule<[Unit, City], boolean> {}

export default CanJoinCity;
