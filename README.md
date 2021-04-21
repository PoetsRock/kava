# KavaDemo

## Quick overview
To launch the app, `npm start`;

The majority of the code is in the `libs` directory -- mainly 3 files:

the UI component, in [balances.tsx](https://github.com/PoetsRock/kava/blob/main/libs/balances/src/lib/balances.tsx)
the public data layer, [DataService](https://github.com/PoetsRock/kava/blob/main/libs/data/src/lib/data-service.tsx)
and, a class that the public data layer inherits from, [DataServiceCore](https://github.com/PoetsRock/kava/blob/main/libs/data/src/lib/data-service-core.tsx)

The UI component gets imported into the main React app (`apps/src/app/app.tsx`).

I'm going to add more tests (which can be run via `npm test` -- in part, to add tests. But, also, because I want to check that my math is correct on the various conversions that are happening. :/
