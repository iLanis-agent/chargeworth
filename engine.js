/* ChargeWorth engine - EV vs gas total cost of ownership, pure functions.
   The question: the EV costs more on the lot but less per km. When (if ever)
   does it overtake the gas car on total spend? */
(function (global) {
  'use strict';

  function round2(x) { return Math.round(x * 100) / 100; }

  // A car: { price, per100km, energyPrice, annualService, annualOther }
  //   gas: per100km = liters/100km, energyPrice = $/liter
  //   ev:  per100km = kWh/100km, energyPrice = $/kWh
  // Usage: { kmPerYear }
  function energyCostPerYear(car, kmPerYear) {
    if (!(car.per100km >= 0) || !(car.energyPrice >= 0) || !(kmPerYear >= 0)) throw new Error('bad inputs');
    return round2(car.per100km / 100 * kmPerYear * car.energyPrice);
  }

  function runningCostPerYear(car, kmPerYear) {
    return energyCostPerYear(car, kmPerYear) + (car.annualService || 0) + (car.annualOther || 0);
  }

  // Cumulative spend after n years (purchase + n years of running)
  function cumulative(car, kmPerYear, years) {
    return car.price + runningCostPerYear(car, kmPerYear) * years;
  }

  // First year (1..maxYears) where cumulative EV < cumulative gas. null if never.
  function breakEvenYear(ev, gas, kmPerYear, maxYears) {
    maxYears = maxYears || 30;
    for (var y = 1; y <= maxYears; y++) {
      if (cumulative(ev, kmPerYear, y) < cumulative(gas, kmPerYear, y)) return y;
    }
    return null;
  }

  // Savings of EV vs gas after n years (positive = EV cheaper)
  function savingsAt(ev, gas, kmPerYear, years) {
    return round2(cumulative(gas, kmPerYear, years) - cumulative(ev, kmPerYear, years));
  }

  // Annual series for the chart: [{year, ev, gas}]
  function series(ev, gas, kmPerYear, years) {
    var out = [];
    for (var y = 0; y <= years; y++) {
      out.push({ year: y, ev: round2(cumulative(ev, kmPerYear, y)), gas: round2(cumulative(gas, kmPerYear, y)) });
    }
    return out;
  }

  // km per year at which EV breaks even within horizon years (0 = never, even free driving won't)
  // Solves: ev.price + runEV*km*y < gas.price + runGas*km*y at y=horizon
  //   => km > (ev.price - gas.price) / ((runGasPerKm - runEVPerKm) * horizon)
  function breakEvenKmPerYear(ev, gas, horizonYears) {
    var perKmGas = gas.per100km / 100 * gas.energyPrice;
    var perKmEV = ev.per100km / 100 * ev.energyPrice;
    var yearlyFixedDelta = (gas.annualService || 0) + (gas.annualOther || 0) - (ev.annualService || 0) - (ev.annualOther || 0);
    var perKmDelta = perKmGas - perKmEV;
    var num = ev.price - gas.price;
    if (num <= 0) return 0; // EV cheaper on the lot: always breaks even
    var denom = perKmDelta * horizonYears + yearlyFixedDelta * horizonYears;
    if (denom <= 0) return null; // driving more never closes the gap
    return round2(num / denom);
  }

  var api = { energyCostPerYear: energyCostPerYear, runningCostPerYear: runningCostPerYear, cumulative: cumulative, breakEvenYear: breakEvenYear, savingsAt: savingsAt, series: series, breakEvenKmPerYear: breakEvenKmPerYear };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.ChargeWorth = api;
})(typeof window !== 'undefined' ? window : globalThis);
