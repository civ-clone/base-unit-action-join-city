import {
  generateGenerator,
  generateWorld,
} from '@civ-clone/core-world/tests/lib/buildWorld';
import CanJoinCity from '../Rules/CanJoinCity';
import City from '@civ-clone/core-city/City';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Cost from '@civ-clone/core-city-growth/Rules/Cost';
import Criterion from '@civ-clone/core-rule/Criterion';
import Destroyed from '@civ-clone/core-unit/Rules/Destroyed';
import Effect from '@civ-clone/core-rule/Effect';
import FoodStorage from '@civ-clone/core-city-growth/Yields/FoodStorage';
import { Game } from '@civ-clone/core-game/Game';
import Grow from '@civ-clone/core-city-growth/Rules/Grow';
import JoinCity from '../JoinCity';
import { Land } from '@civ-clone/core-terrain/Types';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import WorkedTile from '@civ-clone/core-city/WorkedTile';
import WorkedTileRegistry from '@civ-clone/core-city/WorkedTileRegistry';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import { gameForLoad } from '@civ-clone/core-save-game/gameForLoad';
import { hydrate } from '@civ-clone/core-save-game/hydrate';
import joinableCity from '../joinableCity';
import { registerClasses } from '@civ-clone/core-save-game/registerClasses';
import { save } from '@civ-clone/core-save-game/save';

class Settlers extends Unit {}

describe('JoinCity', (): void => {
  let ruleRegistry: RuleRegistry,
    cityRegistry: CityRegistry,
    cityGrowthRegistry: CityGrowthRegistry,
    unitRegistry: UnitRegistry,
    workedTileRegistry: WorkedTileRegistry,
    world: World,
    moved: [Unit, JoinCity][];

  // What a ruleset's `Grow` rules do (Civilization's, in `civ1-city`): empty the food box, set the cost of the next
  // size, and put the new citizen to work on a tile.
  const rulesetRules = () => [
    new Cost(
      new Effect(
        (cityGrowth: CityGrowth): number => 10 * (cityGrowth.size() + 1)
      )
    ),
    new Grow(new Effect((cityGrowth: CityGrowth): void => cityGrowth.empty())),
    new Grow(
      new Effect((cityGrowth: CityGrowth): void =>
        cityGrowth.cost().set((cityGrowth.size() + 1) * 10, 'grow')
      )
    ),
    new Grow(
      new Effect((cityGrowth: CityGrowth): void => {
        const city = cityGrowth.city(),
          [tile] = city
            .tile()
            .getSurroundingArea(2)
            .entries()
            .filter(
              (tile: Tile): boolean => !workedTileRegistry.tileIsWorked(tile)
            );

        workedTileRegistry.register(new WorkedTile(tile, city));
      })
    ),
    new Destroyed(
      new Effect((unit: Unit): void => {
        unit.setDestroyed();
        unitRegistry.unregister(unit);
      })
    ),
    new Moved(
      new Effect((unit: Unit, action: JoinCity): void => {
        moved.push([unit, action]);
      })
    ),
  ];

  const createCity = (player: Player, tile: Tile, size: number = 1): City => {
      const city = new City(
          player,
          tile,
          'city',
          ruleRegistry,
          workedTileRegistry
        ),
        cityGrowth = new CityGrowth(city, ruleRegistry);

      cityRegistry.register(city);
      cityGrowthRegistry.register(cityGrowth);
      // The city's own tile, and one for its first citizen.
      workedTileRegistry.register(
        new WorkedTile(tile, city),
        new WorkedTile(tile.getNeighbour('n'), city)
      );

      while (cityGrowth.size() < size) {
        cityGrowth.grow();
      }

      return city;
    },
    createUnit = (player: Player, tile: Tile): Unit => {
      const unit = new Settlers(null, player, tile, ruleRegistry);

      unitRegistry.register(unit);

      return unit;
    },
    join = (unit: Unit): void =>
      new JoinCity(
        unit.tile(),
        unit.tile(),
        unit,
        joinableCity(unit, unit.tile(), cityRegistry, ruleRegistry)!,
        ruleRegistry,
        cityGrowthRegistry
      ).perform();

  beforeEach(async (): Promise<void> => {
    ruleRegistry = new RuleRegistry();
    cityRegistry = new CityRegistry();
    cityGrowthRegistry = new CityGrowthRegistry();
    unitRegistry = new UnitRegistry();
    workedTileRegistry = new WorkedTileRegistry();
    moved = [];

    ruleRegistry.register(...rulesetRules());

    world = await generateWorld(generateGenerator(9, 9, Land), ruleRegistry);
  });

  it('should grow the city by one and remove the unit', (): void => {
    const player = new Player(ruleRegistry),
      city = createCity(player, world.get(4, 4), 3),
      unit = createUnit(player, city.tile());

    join(unit);

    expect(cityGrowthRegistry.getByCity(city).size()).to.equal(4);
    expect(unit.destroyed()).to.true;
    expect(unitRegistry.getByTile(city.tile())).to.deep.equal([]);
  });

  it('should process `Moved` with the unit and the action, as `FoundCity` does', (): void => {
    const player = new Player(ruleRegistry),
      city = createCity(player, world.get(4, 4)),
      unit = createUnit(player, city.tile());

    join(unit);

    expect(moved.length).to.equal(1);
    expect(moved[0][0]).to.equal(unit);
    expect(moved[0][1]).to.instanceOf(JoinCity);
  });

  it('should give the new citizen a tile and set the next growth cost, through `Grow`', (): void => {
    const player = new Player(ruleRegistry),
      city = createCity(player, world.get(4, 4), 3),
      cityGrowth = cityGrowthRegistry.getByCity(city),
      unit = createUnit(player, city.tile());

    // The city's own tile and one for each citizen.
    expect(workedTileRegistry.getByCity(city).length).to.equal(4);

    join(unit);

    expect(workedTileRegistry.getByCity(city).length).to.equal(5);
    expect(cityGrowth.cost().value()).to.equal(50);
  });

  it('should keep the food the city had stored', (): void => {
    const player = new Player(ruleRegistry),
      city = createCity(player, world.get(4, 4), 3),
      cityGrowth = cityGrowthRegistry.getByCity(city),
      unit = createUnit(player, city.tile());

    cityGrowth.add(new FoodStorage(27));

    join(unit);

    expect(cityGrowth.progress().value()).to.equal(27);
  });

  it('should keep the food the city had stored, when a rule adds food on growth', (): void => {
    const player = new Player(ruleRegistry),
      city = createCity(player, world.get(4, 4), 3),
      cityGrowth = cityGrowthRegistry.getByCity(city),
      unit = createUnit(player, city.tile());

    // Like Civilization's Granary, which half-fills the food box after the city grows from food.
    ruleRegistry.register(
      new Grow(
        new Effect((cityGrowth: CityGrowth): void =>
          cityGrowth.add(new FoodStorage(cityGrowth.cost().value() / 2))
        )
      )
    );

    cityGrowth.add(new FoodStorage(12));

    join(unit);

    expect(cityGrowth.progress().value()).to.equal(12);
  });

  it('should keep the city when made for another unit', (): void => {
    const player = new Player(ruleRegistry),
      city = createCity(player, world.get(4, 4), 3),
      unit = createUnit(player, city.tile()),
      other = createUnit(player, city.tile());

    new JoinCity(
      city.tile(),
      city.tile(),
      unit,
      city,
      ruleRegistry,
      cityGrowthRegistry
    )
      .forUnit(other)
      .perform();

    expect(cityGrowthRegistry.getByCity(city).size()).to.equal(4);
    expect(other.destroyed()).to.true;
    expect(unit.destroyed()).to.false;
  });

  it("should offer one of the unit's player's cities on its tile", (): void => {
    const player = new Player(ruleRegistry),
      city = createCity(player, world.get(4, 4)),
      unit = createUnit(player, city.tile());

    expect(
      joinableCity(unit, unit.tile(), cityRegistry, ruleRegistry)
    ).to.equal(city);
  });

  it("should not offer another player's city", (): void => {
    const city = createCity(new Player(ruleRegistry), world.get(4, 4)),
      unit = createUnit(new Player(ruleRegistry), city.tile());

    expect(joinableCity(unit, unit.tile(), cityRegistry, ruleRegistry)).to.null;
  });

  it("should not offer anything off a city's tile", (): void => {
    const player = new Player(ruleRegistry),
      city = createCity(player, world.get(4, 4)),
      unit = createUnit(player, city.tile().getNeighbour('e'));

    expect(joinableCity(unit, unit.tile(), cityRegistry, ruleRegistry)).to.null;
  });

  it('should leave the size limit to `CanJoinCity` rules', (): void => {
    const player = new Player(ruleRegistry),
      smallCity = createCity(player, world.get(2, 2), 9),
      largeCity = createCity(player, world.get(6, 6), 10),
      smallCityUnit = createUnit(player, smallCity.tile()),
      largeCityUnit = createUnit(player, largeCity.tile());

    // Without a rule, any size of city can be joined.
    expect(
      joinableCity(largeCityUnit, largeCity.tile(), cityRegistry, ruleRegistry)
    ).to.equal(largeCity);

    ruleRegistry.register(
      new CanJoinCity(
        new Effect(
          (unit: Unit, city: City): boolean =>
            cityGrowthRegistry.getByCity(city).size() < 10
        )
      )
    );

    expect(
      joinableCity(smallCityUnit, smallCity.tile(), cityRegistry, ruleRegistry)
    ).to.equal(smallCity);
    expect(
      joinableCity(largeCityUnit, largeCity.tile(), cityRegistry, ruleRegistry)
    ).to.null;
  });

  it('should only apply a `CanJoinCity` rule whose criteria are met', (): void => {
    const player = new Player(ruleRegistry),
      city = createCity(player, world.get(4, 4)),
      unit = createUnit(player, city.tile());

    ruleRegistry.register(
      new CanJoinCity(
        new Criterion((unit: Unit): boolean => !(unit instanceof Settlers)),
        new Effect((): boolean => false)
      )
    );

    expect(
      joinableCity(unit, unit.tile(), cityRegistry, ruleRegistry)
    ).to.equal(city);
  });
});

describe('JoinCity, saved', (): void => {
  it('should save and load a game after a unit joins a city', async (): Promise<void> => {
    const game = new Game();

    game.engine.registerPlugins({
      '@civ-clone/base-unit-action-join-city': 'test',
    });
    registerClasses(game);
    game.classes.register(Settlers, Land);

    game.rules.register(
      new Grow(
        new Effect((cityGrowth: CityGrowth): void => cityGrowth.empty())
      ),
      new Grow(
        new Effect((cityGrowth: CityGrowth): void =>
          game.workedTiles.register(
            new WorkedTile(
              cityGrowth.city().tile().getNeighbour('s'),
              cityGrowth.city()
            )
          )
        )
      ),
      new Destroyed(new Effect((unit: Unit): void => unit.setDestroyed()))
    );

    const world = await generateWorld(
        generateGenerator(5, 5, Land),
        game.rules,
        game.landMasses
      ),
      player = new Player(game.rules),
      city = new City(
        player,
        world.get(2, 2),
        'city',
        game.rules,
        game.workedTiles
      ),
      cityGrowth = new CityGrowth(city, game.rules),
      unit = new Settlers(null, player, city.tile(), game.rules);

    game.cities.register(city);
    game.cityGrowth.register(cityGrowth);
    game.workedTiles.register(new WorkedTile(city.tile(), city));
    game.units.register(unit);

    cityGrowth.add(new FoodStorage(7));

    new JoinCity(
      city.tile(),
      city.tile(),
      unit,
      joinableCity(unit, city.tile(), game.cities, game.rules)!,
      game.rules,
      game.cityGrowth
    ).perform();

    const file = save(game, { name: 'test', createdAt: 0 }),
      loaded = gameForLoad({
        classes: game.classes,
        engine: game.engine,
        rules: game.rules,
      });

    hydrate(file, loaded);

    const [loadedCity] = loaded.cities.entries(),
      loadedGrowth = loaded.cityGrowth.getByCity(loadedCity),
      [loadedUnit] = loaded.units
        .entries()
        .filter((loadedUnit: Unit): boolean => loadedUnit.id() === unit.id());

    expect(loadedCity.id()).to.equal(city.id());
    expect(loadedGrowth.size()).to.equal(2);
    expect(loadedGrowth.progress().value()).to.equal(7);
    expect(loaded.workedTiles.getByCity(loadedCity).length).to.equal(2);
    expect(loadedUnit.destroyed()).to.true;
    expect(loaded.units.getByTile(loadedCity.tile()).length).to.equal(0);
    // Saving the loaded game writes the same entities. (Not the whole file: making the game to load into creates a new
    // `Turn` and `Year`, which moves their id counters.)
    expect(
      JSON.stringify(save(loaded, { name: 'test', createdAt: 0 }).entities) ===
        JSON.stringify(file.entities)
    ).to.true;
  });
});
