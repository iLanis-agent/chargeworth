# ChargeWorth

The EV pitch is always "cheaper to run" and the counter is always "more to buy". Both
are true; the real question is when one overtakes the other for *your* driving.
ChargeWorth is an honest EV-vs-gas total-cost calculator: plug in annual kilometers,
both prices, consumption, energy costs and service, and it computes cumulative spend
year by year, names the exact break-even year, and shows both cost curves crossing on
the chart.

- Break-even year solved exactly (or an honest "never within 30 years")
- 10-year savings headline, yearly running-cost comparison
- Reverse solve: how many km/year you'd need for the EV to pay off within 8 years
- No signup, nothing to install - pure static HTML/JS
- `engine.js` holds the cost model as pure functions, shared between the app and node tests

## Use it

Open `index.html`, or visit the deployed site.

## Run locally

Any static server works:

```
python3 -m http.server
```

Then open http://localhost:8000/.

## Engine tests

The node suite covers energy/running/cumulative costs, exact break-even year
(including "year 5 behind, year 6 ahead"), cheaper-on-lot immediate win, the
never-breaks-even case, the km-per-year reverse solve, and series shape for the chart.
