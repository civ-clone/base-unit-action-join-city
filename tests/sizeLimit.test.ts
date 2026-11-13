import City from '@civ-clone/core-city/City';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import CityGrowthRegistry from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { expect } from 'chai';
import tooLargeToJoin from '../lib/sizeLimit';

describe('tooLargeToJoin', (): void => {
  // A stand-in city whose growth reports `size`, registered in its own registry.
  const cityOfSize = (size: number): [City, CityGrowthRegistry] => {
    const city = {} as City,
      cityGrowth = Object.assign(Object.create(CityGrowth.prototype), {
        city: (): City => city,
        size: (): number => size,
      }) as CityGrowth,
      cityGrowthRegistry = new CityGrowthRegistry();

    cityGrowthRegistry.register(cityGrowth);

    return [city, cityGrowthRegistry];
  };

  it('should allow a city below the limit', (): void => {
    expect(tooLargeToJoin(10)(...cityOfSize(9))).false;
    expect(tooLargeToJoin(10)(...cityOfSize(1))).false;
  });

  it('should refuse a city whose size has reached the limit', (): void => {
    expect(tooLargeToJoin(10)(...cityOfSize(10))).true;
    expect(tooLargeToJoin(10)(...cityOfSize(11))).true;
  });

  it('should use the limit it was given', (): void => {
    expect(tooLargeToJoin(3)(...cityOfSize(2))).false;
    expect(tooLargeToJoin(3)(...cityOfSize(3))).true;
    expect(tooLargeToJoin(4)(...cityOfSize(3))).false;
  });
});
