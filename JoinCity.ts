import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import Action from '@civ-clone/core-unit/Action';
import City from '@civ-clone/core-city/City';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';

export class JoinCity extends Action {
  private _city: City;
  private _cityGrowthRegistry: CityGrowthRegistry;

  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    city: City,
    ruleRegistry: RuleRegistry = ruleRegistryInstance,
    cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance
  ) {
    super(from, to, unit, ruleRegistry);

    this._city = city;
    this._cityGrowthRegistry = cityGrowthRegistry;
  }

  perform(): void {
    const cityGrowth = this._cityGrowthRegistry.getByCity(this._city),
      storedFood = cityGrowth.progress().value();

    // Grown through `CityGrowth`, so the ruleset's `Grow` rules give the new citizen a tile (or make it a specialist)
    // and set the cost of the next size.
    cityGrowth.grow();

    // Those rules also empty the food box (or, with a Granary, half-fill it), which is what growing from food costs. A
    // citizen who arrives with a unit costs the city no food, so it keeps what it had stored, as in Civilization, where
    // the size goes up by one and nothing else changes.
    cityGrowth.progress().set(storedFood, 'join-city');

    this.unit().destroy();

    this.ruleRegistry().process(Moved, this.unit(), this);
  }
}

export default JoinCity;
