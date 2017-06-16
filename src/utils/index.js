import format from 'date-fns/format';
import addDays from 'date-fns/add_days';
import isAfter from 'date-fns/is_after';

// table for the beet model
import { table } from './table';

// api
import {
  fetchACISData,
  getSisterStationIdAndNetwork,
  fetchSisterStationData,
  fetchForecastData
} from 'utils/api';

// PRE FETCHING ---------------------------------------------------------
export const matchIconsToStations = (protocol, stations, state) => {
  const arr = [];
  const newa = `${protocol}//newa2.nrcc.cornell.edu/gifs/newa_small.png`;
  const newaGray = `${protocol}//newa2.nrcc.cornell.edu/gifs/newa_smallGray.png`;
  const airport = `${protocol}//newa2.nrcc.cornell.edu/gifs/airport.png`;
  const airportGray = `${protocol}//newa2.nrcc.cornell.edu/gifs/airportGray.png`;
  const culog = `${protocol}//newa2.nrcc.cornell.edu/gifs/culog.png`;
  const culogGray = `${protocol}//newa2.nrcc.cornell.edu/gifs/culogGray.png`;

  stations.forEach(station => {
    if (
      station.network === 'newa' ||
      station.network === 'njwx' ||
      station.network === 'miwx' ||
      ((station.network === 'cu_log' || station.network === 'culog') &&
        station.state !== 'NY')
    ) {
      const newObj = station;
      station.state === state.postalCode || state.postalCode === 'ALL'
        ? (newObj['icon'] = newa)
        : (newObj['icon'] = newaGray);
      arr.push(newObj);
    } else if (station.network === 'cu_log' || station.network === 'culog') {
      const newObj = station;
      station.state === state.postalCode || state.postalCode === 'ALL'
        ? (newObj['icon'] = culog)
        : (newObj['icon'] = culogGray);
      newObj['icon'] = culog;
      arr.push(newObj);
    } else if (station.network === 'icao') {
      const newObj = station;
      station.state === state.postalCode || state.postalCode === 'ALL'
        ? (newObj['icon'] = airport)
        : (newObj['icon'] = airportGray);
      arr.push(newObj);
    }
  });
  // console.log(arr);
  return arr;
};

// Handling Temperature parameter and Michigan network id adjustment
export const networkTemperatureAdjustment = network => {
  // Handling different temperature parameter for each network
  if (network === 'newa' || network === 'icao' || network === 'njwx') {
    return '23';
  } else if (
    network === 'miwx' ||
    (network === 'cu_log' || network === 'culog')
  ) {
    return '126';
  }
};

// Handling Relative Humidity Adjustment
export const networkHumidityAdjustment = network =>
  network === 'miwx' ? '143' : '24';

// Handling Michigan state ID adjustment
export const michiganIdAdjustment = station => {
  if (
    station.state === 'MI' &&
    station.network === 'miwx' &&
    station.id.slice(0, 3) === 'ew_'
  ) {
    // example: ew_ITH
    return station.id.slice(3, 6);
  }
  return station.id;
};

export const allStations = (
  protocol,
  acis,
  stations,
  state,
  startDate,
  endDate
) => {
  let stationsWithIcons = matchIconsToStations(protocol, stations, state);

  // building the station object with the things I might need
  for (const station of stationsWithIcons) {
    station['sid'] = `${station.name} ${station.network}`;
    station['sdate'] = startDate;
    station['edate'] = format(addDays(endDate, 6), 'YYYY-MM-DD');
    station['id-adj'] = michiganIdAdjustment(station);
    station['elems'] = [
      // temperature
      networkTemperatureAdjustment(station.network),
      // relative humidity
      networkHumidityAdjustment(station.network),
      // leaf wetness
      '118',
      // precipitation
      '5'
    ];
  }
  // console.log(stationsWithIcons);
  return stationsWithIcons;
};

// POST FETCHING ----------------------------------------------------------------------------

// Returns the average of two numbers.
export const avgTwoStringNumbers = (a, b) => {
  const aNum = parseFloat(a);
  const bNum = parseFloat(b);
  return Math.round((aNum + bNum) / 2).toString();
};

export const replaceNonConsecutiveMissingValues = data => {
  if (data) {
    return data.map(day => {
      return day.map(param => {
        if (Array.isArray(param)) {
          return param.map((e, i) => {
            if (i === 0 && e === 'M') {
              return param[i + 1];
            } else if (i === param.length - 1 && e === 'M') {
              return param[i - 1];
            } else if (
              e === 'M' &&
              param[i - 1] !== 'M' &&
              param[i + 1] !== 'M'
            ) {
              return avgTwoStringNumbers(param[i - 1], param[i + 1]);
            } else {
              return e;
            }
          });
        }
        return param;
      });
    });
  }
};

// export const weightedAverage = arr => {
//   const firstM = arr.findIndex(e => e === "M");
//   const lastM = arr.lastIndexOf("M");
//   const missingValues = arr.filter(e => e === "M").length;
// };

// Replaces current station (cStation) missing values with compared station
export const replaceMissingValues = (cStation, sStation) => {
  return cStation.map((e, i) => {
    if (e === 'M' && sStation[i] !== 'M') {
      return sStation[i].toString();
    }
    return e.toString();
  });
};

// Returns rh array containing new values.
// The new values are calculated according to the equation below.
export const RHAdjustment = arr => {
  return arr.map(e => {
    if (e !== 'M') {
      return Math.round(parseFloat(e) / (0.0047 * parseFloat(e) + 0.53));
    } else {
      return e;
    }
  });
};

// Returns average of all the values in array
export const average = data => {
  // handling the case for T and W
  if (data.length === 0) return 0;

  //  calculating average
  let results = data.map(e => parseFloat(e));
  return Math.round(results.reduce((acc, val) => acc + val, 0) / data.length);
};

// Returns array with elements above the second argument of the function
export const aboveValue = (data, value) => {
  return data.map(e => {
    if (e > value) {
      return e;
    }
    return false;
  });
};

// Returns array with elements equal to and above the second argument of the function
export const aboveEqualToValue = (data, value) => {
  return data.map(e => {
    if (e >= value) {
      return e;
    }
    return false;
  });
};

// Convert Fahrenheit to Celcius
export const fahrenheitToCelcius = data => {
  return (data - 32) * 5 / 9;
};

// Returns wetness interval (W) and average temperature at those intervals (T)
export const leafWetnessAndTemps = (day, currentYear, startDateYear) => {
  let RH, PT, LW, TP, params;
  if (currentYear === startDateYear) {
    TP = day.tpFinal;
    RH = day.rhFinal.map(e => (e >= 90 ? e : false));
    PT = day.ptFinal.map(e => (e > 0 ? e : false));
    params = [RH, PT];
  } else {
    TP = day.tpFinal;
    RH = day.rhFinal.map(e => (e >= 90 ? e : false));
    LW = day.lwFinal.map(e => (e > 0 ? e : false));
    PT = day.ptFinal.map(e => (e > 0 ? e : false));
    params = [RH, PT, LW];
  }
  // console.log(params);
  const transpose = m => m[0].map((x, i) => m.map(x => x[i]));

  // Returns true if there is at least one true value in the array
  const transposed = transpose(params).map(e => e.find(e => e !== false));
  // console.log(transposed);
  let indices = transposed.map((e, i) => (e !== undefined ? i : e));
  // console.log(indices);
  indices = indices.filter(e => typeof e === 'number');
  // console.log(indices);
  let pairs = [];
  for (const [i, e] of indices.entries()) {
    if (i !== 0) {
      const L = indices[i - 1];
      const R = e;
      const T = R - L;
      const size = R - L + 1;
      if (T < 5) {
        pairs.push([L, R, size]);
      }
    }
  }
  // console.log(pairs);

  for (const pair of pairs) {
    for (let i = 0; i < pair[2]; i++) {
      transposed.splice(pair[0] + i, 1, true);
    }
  }

  // console.log(transposed);
  const W = transposed.filter(e => e === true).length;
  // console.log(W);

  const filteredTemps = TP.map((temp, i) => {
    if (transposed[i] === true) {
      return temp;
    }
    return undefined;
  });

  // console.log(filteredTemps);
  let T = average(filteredTemps.filter(e => e !== undefined));
  T = fahrenheitToCelcius(T);
  // console.log(W, T);
  return { W, T };
};

// Berries model ----------------------------------------------------------------------------
export const botrytisModel = data => {
  const W = data.W;
  const T = data.T;
  const i = -4.268 + 0.0294 * W * T - 0.0901 * W - 0.0000235 * W * T ** 3;
  return (1 / (1 + Math.exp(-i))).toFixed(2);
};

export const anthracnoseModel = data => {
  const W = data.W;
  const T = data.T;
  const i =
    -3.7 +
    0.33 * W -
    0.069 * W * T +
    0.005 * W * T ** 2 -
    0.000093 * W * T ** 3;
  return (1 / (1 + Math.exp(-i))).toFixed(2);
};

// This function will shift data from (0, 23) to (13, 12)
export const noonToNoon = data => {
  let results = [];

  // get all dates
  const dates = data.map(day => day[0]);

  // shifting Temperature array
  const TP = data.map(day => day[1]);
  const TPFlat = [].concat(...TP);
  let TPShifted = [];
  while (TPFlat.length > 24) {
    TPShifted.push(TPFlat.splice(12, 24));
  }

  // shifting relative humidity array
  let RH = data.map(day => day[2]);
  const RHFlat = [].concat(...RH);
  let RHShifted = [];
  while (RHFlat.length > 24) {
    RHShifted.push(RHFlat.splice(12, 24));
  }

  // shifting leaf wetness array
  const LW = data.map(day => day[3]);
  const LWFlat = [].concat(...LW);
  let LWShifted = [];
  while (LWFlat.length > 24) {
    LWShifted.push(LWFlat.splice(12, 24));
  }

  // shifting precipitation array
  const PT = data.map(day => day[4]);
  const PTFlat = [].concat(...PT);
  let PTShifted = [];
  while (PTFlat.length > 24) {
    PTShifted.push(PTFlat.splice(12, 24));
  }

  for (const [i, el] of dates.entries()) {
    results[i] = [el, TPShifted[i], RHShifted[i], LWShifted[i], PTShifted[i]];
  }

  // Since to shift data we requested one day more from the server, we slice to get rid of
  // the extra day
  return results.slice(0, -1);
};

// Testing ----------------------------------------------------------------------------
// import nd from "./fakeDataBeetModel.json";
// nd.map(e => console.log(e))
// const ndTp = nd.map(e => e.tp);
// let tp = [];
// while (ndTp.length > 24) {
//   tp.push(ndTp.splice(12, 24));
// }
// const ndRh = nd.map(e => e.rh);
// let rh = [];
// while (ndRh.length > 24) {
//   rh.push(ndRh.splice(12, 24));
// }
// ------------------------------------------------------------------------------------
// Returns the data array (MAIN FUNCTION) ---------------------------------------------------
export const getData = async (
  protocol,
  station,
  startDate,
  endDate,
  currentYear,
  startDateYear
) => {
  // Cleaning and Adjustments
  let acis = [];
  acis = await fetchACISData(protocol, station, startDate, endDate);
  acis = replaceNonConsecutiveMissingValues(acis);
  acis = noonToNoon(acis);
  // acis.slice(0, 3).map(e => e.map(d => console.log(d)));

  // currentYear !== startDateYear means it is not this year, hence no forecast
  let results = [];
  if (currentYear !== startDateYear) {
    for (const day of acis) {
      // creating a 'day' object with the returned params from ACIS
      results.push({
        date: day[0],
        tp: day[1],
        rh: day[2],
        lw: day[3],
        pt: day[4]
      });
    }

    const idAndNetwork = await getSisterStationIdAndNetwork(protocol, station);
    let sisterStationData = await fetchSisterStationData(
      protocol,
      idAndNetwork,
      station,
      startDate,
      endDate,
      currentYear,
      startDateYear
    );
    // sisterStationData.slice(0, 3).map(e => e.map(d => console.log(d)));
    // if (sisterStationData.length > 0) {
    sisterStationData = replaceNonConsecutiveMissingValues(sisterStationData);
    sisterStationData = noonToNoon(sisterStationData);
    // }

    // Adding to the 'day' object, sister's data
    for (const [i, day] of sisterStationData.entries()) {
      results[i]['tpSis'] = day[1];
      results[i]['rhSis'] = day[2];
      results[i]['lwSis'] = day[3];
      results[i]['ptSis'] = day[4];
    }

    // replacing missing values with sister station
    for (const [i, day] of results.entries()) {
      results[i]['tpFinal'] = replaceMissingValues(day.tp, day.tpSis);
      results[i]['rhFinal'] = replaceMissingValues(day.rh, day.rhSis);

      // results[i]["tpFinal"] = tp[i];
      // results[i]["rhFinal"] = rh[i];

      results[i]['lwFinal'] = replaceMissingValues(day.lw, day.lwSis);
      results[i]['ptFinal'] = replaceMissingValues(day.pt, day.ptSis);
    }
    // console.log("We are in past year");
    // results.map(e => console.log(e.date, e.tp, e.tpSis, e.tpFinal));
  } else {
    // currentYear === startDateYear means it is forecast
    for (const day of acis) {
      // creating a 'day' object with the returned params from ACIS
      results.push({
        date: day[0],
        tp: day[1],
        rh: day[2],
        pt: day[4]
      });
    }

    const idAndNetwork = await getSisterStationIdAndNetwork(protocol, station);
    let sisterStationData = await fetchSisterStationData(
      protocol,
      idAndNetwork,
      station,
      startDate,
      endDate,
      currentYear,
      startDateYear
    );
    sisterStationData = replaceNonConsecutiveMissingValues(sisterStationData);
    sisterStationData = noonToNoon(sisterStationData);

    // Adding to the 'day' object, sister's data
    for (const [i, day] of sisterStationData.entries()) {
      results[i]['tpSis'] = day[1];
      results[i]['rhSis'] = day[2];
      results[i]['ptSis'] = day[4];
    }

    // replacing missing values with sister station
    for (const [i, day] of results.entries()) {
      results[i]['tpCurrentAndSiter'] = replaceMissingValues(day.tp, day.tpSis);
      results[i]['rhCurrentAndSiter'] = replaceMissingValues(day.rh, day.rhSis);
      results[i]['ptCurrentAndSiter'] = replaceMissingValues(day.pt, day.ptSis);
    }
    // fetching forecast data
    let forecastData = await fetchForecastData(
      protocol,
      station,
      startDate,
      endDate
    );
    // forecastData = replaceNonConsecutiveMissingValues(forecastData);
    forecastData = noonToNoon(forecastData);

    // forecastData.map(day => day.map(p => console.log(p)));

    // Adding to the 'day' object, forecast data
    for (const [i, day] of forecastData.entries()) {
      results[i]['tpForecast'] = day[1];
      results[i]['rhForecast'] = day[2];
      results[i]['ptForecast'] = day[3];
    }

    // replacing tpDiff values with forecast station temperatures (tpf)
    for (const [i, day] of results.entries()) {
      results[i]['tpFinal'] = replaceMissingValues(
        day.tpCurrentAndSiter,
        day.tpForecast
      );
      // Forcast data needs to have relative humidity array adjusted
      results[i]['rhFinal'] = RHAdjustment(
        replaceMissingValues(day.rhCurrentAndSiter, day.rhForecast)
      );
      // results[i]["tpFinal"] = tp[i];
      // results[i]["rhFinal"] = rh[i];
      results[i]['ptFinal'] = replaceMissingValues(
        day.ptCurrentAndSiter,
        day.ptForecast
      );
    }
  }
  // results.slice(0, 5).map(e => console.log(e))
  // Add to the results objects params that might be needed
  const base = 50;
  let cdd = 0;
  let cumulativeMissingDays = 0;
  for (const [i, day] of results.entries()) {
    results[i]['base'] = base;

    // date to display on graphs
    results[i]['dateGraph'] = format(day.date, 'MMM D');

    // date to display as text
    results[i]['dateText'] = format(day.date, 'MMMM Do');

    // date to display in tables
    let dateTable = format(day.date, 'MMM D');
    const today = new Date();
    if (isAfter(day.date, today)) {
      dateTable = `${dateTable} - Forecast`;
    }
    results[i]['dateTable'] = dateTable;

    // Return true if arrays do not contain missing values
    const isRhClean = day.rhFinal.filter(e => e === 'M').length === 0;
    const isTpClean = day.tpFinal.filter(e => e === 'M').length === 0;

    if (isTpClean && isRhClean) {
      let Tmin,
        Tmax,
        Tavg,
        tempsAboveRH = [];
      day.rhFinal.forEach((rh, i) => {
        if (rh >= 90) {
          tempsAboveRH.push(day.tpFinal[i]);
        }
      });
      Tmin = tempsAboveRH.length > 0 ? Math.min(...tempsAboveRH) : null;
      Tmax = tempsAboveRH.length > 0 ? Math.max(...tempsAboveRH) : null;
      // Tavg = average(tempsAboveRH);
      Tavg = Math.round((Tmin + Tmax) / 2);

      cumulativeMissingDays += 0;
      results[i]['Tmin'] = Tmin;
      results[i]['Tmax'] = Tmax;
      results[i]['Tavg'] = Tavg;
      results[i]['missingDay'] = 0;
      results[i]['cumulativeMissingDays'] = cumulativeMissingDays;

      // calculate dd (degree day)
      const dd = Tavg - base > 0 ? Tavg - base : 0;
      results[i]['dd'] = dd;

      // calculate cdd (cumulative degree day)
      cdd += dd;
      results[i]['cdd'] = cdd;

      // returns relative humidity above or equal to 90% (RH >= 90)
      const rhAboveValues = aboveEqualToValue(day.rhFinal, 90);
      results[i]['rhAboveValues'] = rhAboveValues;

      // Number of hours where relative humidity is equal to or above 90%
      const hrsRH = rhAboveValues.filter(e => e !== false).length;
      results[i]['hrsRH'] = hrsRH;

      // calculate dicv..
      let dicv = 0;
      if (Tavg >= 59 && Tavg <= 94 && hrsRH > 0) {
        dicv = table[hrsRH.toString()][Tavg.toString()];
      }
      // console.log(day.date, Tavg);
      results[i]['dicv'] = dicv;
      // console.log(day.date, Tavg, hrsRH, Tavg, dicv)
    } else {
      cumulativeMissingDays += 1;
      results[i]['Tmin'] = 'No data';
      results[i]['Tmax'] = 'No data';
      results[i]['Tavg'] = 'No data';
      results[i]['missingDay'] = 1;
      results[i]['cumulativeMissingDays'] = cumulativeMissingDays;
      results[i]['rhAboveValues'] = 'No data';
      results[i]['hrsRH'] = 'No data';
      results[i]['dicv'] = 0.0001;
    }
  }
  // results.map(e => console.log(e));
  return results;
};
