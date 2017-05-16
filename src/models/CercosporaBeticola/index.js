import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import takeRight from "lodash/takeRight";
import { autorun } from "mobx";

import { Flex, Box } from "reflexbox";

// components
import Graph from "./Graph";

import ReactTable from "react-table";
import "react-table/react-table.css";

import "styles/table.styl";

// To display the 'forecast text' and style the cell
const forecastText = date => {
  return (
    <div>
      <div>{date.split("-")[0]}</div>
      <div style={{ color: "red" }}>
        {date.split("-")[1]}
      </div>
    </div>
  );
};

@inject("store")
@observer
export default class CercosporaBeticola extends Component {
  constructor(props) {
    super(props);
    autorun(() => this.createDataModel());
  }

  createDataModel = () => {
    this.props.store.app.resetCercospora();
    const { ACISData } = this.props.store.app;
    const data = {};
    let a2Day = 0;
    let season = 0;
    let description = [];

    for (const [i, day] of ACISData.entries()) {
      // determine a2Day
      if (i >= 1) {
        a2Day = day.dicv + ACISData[i - 1].dicv;
      }

      // a2Day Infection Risk
      let a2DayIR = "";
      let color = "";
      let colorBar = "";
      if (a2Day >= 0 && a2Day <= 3) {
        a2DayIR = "Low";
        color = "low";
        colorBar = "#81C784";
      } else if (a2Day >= 4 && a2Day <= 6) {
        a2DayIR = "Moderate";
        color = "moderate";
        colorBar = "#FCCE00";
      } else {
        a2DayIR = "High";
        color = "high";
        colorBar = "#f44336";
      }

      // 14-Day Accumulation Infection Values
      let a14Day = new Array(14).fill(0);
      let a14DayMissingDays = 0;
      if (i >= 14) {
        a14Day = ACISData.slice(i - 14, i).map(e => e.dicv);
        a14DayMissingDays = ACISData.slice(i - 14, i).map(e => e.missingDay);
        a14DayMissingDays = a14DayMissingDays.reduce(
          (acc, val) => acc + val,
          0
        );
      }
      // 21-Day Accumulation Infection Values
      let a21Day = new Array(21).fill(0);
      let a21DayMissingDays = 0;
      if (i >= 21) {
        a21Day = ACISData.slice(i - 21, i).map(e => e.dicv);
        a21DayMissingDays = ACISData.slice(i - 21, i).map(e => e.missingDay);
        a21DayMissingDays = a21DayMissingDays.reduce(
          (acc, val) => acc + val,
          0
        );
      }

      // Description
      if (day.missingDay === 1) {
        description.push(day.dateText);
      }

      // Season Total Infection Values
      season += day.dicv;
      // building the object
      data["dateTable"] = day.dateTable;
      data["dateGraph"] = day.dateGraph;
      data["dateText"] = day.dateText;
      data["dicv"] = parseInt(day.dicv, 10);
      data["a2Day"] = parseInt(a2Day, 10);
      data["a2DayIR"] = a2DayIR;
      data["color"] = color;
      data["colorBar"] = colorBar;
      data["a14Day"] = parseInt(a14Day[13], 10);
      data["a14DayMissingDays"] = a14DayMissingDays;
      data["a21Day"] = parseInt(a21Day[20], 10);
      data["a21DayMissingDays"] = a21DayMissingDays;
      data["season"] = parseInt(season, 10);
      data["missingDay"] = day.missingDay;
      data["cumulativeMissingDays"] = day.cumulativeMissingDays;
      data["missingDates"] =
        "loresdfsdfasdfasdfasdfasdfasdfasdfasdfasdfasdfadsfasdfad";
      this.props.store.app.setCercosporaBeticola(data);
    }
  };

  render() {
    const {
      ACISData,
      station,
      areRequiredFieldsSet,
      cercosporaBeticola,
      isGraph
    } = this.props.store.app;
    const { mobile } = this.props;

    const columns = [
      {
        Header: "Date",
        columns: [
          {
            Header: "",
            accessor: "dateTable", // String-based value accessors!
            Cell: d => forecastText(d.value)
          }
        ]
      },
      {
        Header: "Infection Values",
        columns: [
          {
            Header: "Daily",
            accessor: "dicv"
          },
          {
            Header: "2-Day",
            accessor: "a2Day"
          }
        ]
      },
      {
        Header: "Accumulation Infection Values",
        columns: [
          {
            Header: "14-Day",
            accessor: "a14Day"
          },
          {
            Header: "21-Day",
            accessor: "a21Day"
          },
          {
            Header: `Season`,
            accessor: "season"
          }
        ]
      }
    ];

    return (
      <Flex column>
        <Box>
          <h2>
            Cercospora leaf spot on table beet Prediction For {station.name}
          </h2>
        </Box>

        <Flex justify="center">
          <Box mt={1} col={12} lg={12} md={12} sm={12}>
            <ReactTable
              style={{ textAlign: "center" }}
              className="-striped -highlight"
              loading={ACISData.length === 0}
              showPagination={false}
              defaultPageSize={8}
              data={
                areRequiredFieldsSet ? takeRight(cercosporaBeticola, 8) : null
              }
              columns={columns}
            />
          </Box>
        </Flex>
        {isGraph && <Graph />}
      </Flex>
    );
  }
}
