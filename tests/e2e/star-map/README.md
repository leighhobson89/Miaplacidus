# Star Map

Browser coverage for the Interstellar map, study visibility, search feedback, home-system gate, and pointer/keyboard pan and zoom behavior. The catalogue math and discovery model are also covered in `tests/unit/star-catalogue.spec.ts`.

The focused Chrome area passed 4/4 on 5 October 2026. The keyboard case zooms in, focuses the map, and confirms ArrowRight and ArrowDown change the view box. Star Data navigation is scoped through the Interstellar section tab list, and its table controls are scoped to the sibling Star Data panel.

The Star Map tests now also assert that an unreported factory system is absent from Star Data, disabled map markers expose an accessible reason, Star Data actions have row-specific names, sort direction is announced, and the selected route's antimatter/AP preview matches its Star Data row. These new assertions are pending the next serialized Chrome run; unit coverage currently checks hidden-factory filtering and selector-backed route values.
