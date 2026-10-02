# base-unit-action-join-city

This package provides the `JoinCity` `Action` for `Unit`s: a unit (in Civilization, a Settlers) joining one of its
player's cities, adding one to its size.

- `JoinCity` grows the city through `CityGrowth.grow()`, so the ruleset's `Grow` rules give the new citizen a tile and
  set the next growth cost, then destroys the unit. The city keeps the food it had stored.
- `joinableCity(unit, tile)` returns the unit's player's `City` on `tile` if the unit may join it, or `null`.
- `CanJoinCity` rules limit which cities a unit may join (Civilization: under size 10). Which units may join is decided
  by the rule that offers the action.
