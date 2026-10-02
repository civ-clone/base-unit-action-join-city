import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
export declare class JoinCity extends Action {
  private _city;
  private _cityGrowthRegistry;
  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    city: City,
    ruleRegistry?: RuleRegistry,
    cityGrowthRegistry?: CityGrowthRegistry
  );
  forUnit(unit: Unit): JoinCity;
  perform(): void;
}
export default JoinCity;
