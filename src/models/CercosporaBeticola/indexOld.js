import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import takeRight from "lodash/takeRight";
import { autorun } from "mobx";

import "styles/table.styl";
import { Flex, Box } from "reflexbox";

import Table from "antd/lib/table";
import "antd/lib/table/style/css";

// components
import Graph from "./Graph";

// styled-components
import { RiskLevel } from "./styles";

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

const dicv = (text, record, i) => {
  if (record.missingDay) return "No data";
  return (
    <div>
      {text}
    </div>
  );
};

const a2Day = (text, record, i) => {
  if (record.missingDay) return "No data";
  return (
    <div>
      <span style={{ color: record.colorBar }}>{text}</span>
      <RiskLevel style={{ background: record.colorBar }}>
        {record.a2DayIR}
      </RiskLevel>
    </div>
  );
};

const a14Day = (text, record, i) => {
  if (record.missingDay) return "No data";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "center"
      }}
    >
      <span style={{ marginRight: "5px" }}>{text}</span>
      <span style={{ color: "red", fontSize: ".6rem" }}>
        {" "}(+{record.a14DayMissingDays})
      </span>
    </div>
  );
};

const a21Day = (text, record, i) => {
  if (record.missingDay) return "No data";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "center"
      }}
    >
      <span style={{ marginRight: "5px" }}>{text}</span>
      <span style={{ color: "red", fontSize: ".6rem" }}>
        {" "}(+{record.a21DayMissingDays})
      </span>
    </div>
  );
};

const season = (text, record, i) => {
  if (record.missingDay) return "No data";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "center"
      }}
    >
      <span style={{ marginRight: "5px" }}>{text}</span>
      <span style={{ color: "red", fontSize: ".6rem" }}>
        {" "}(+{record.cumulativeMissingDays})
      </span>
    </div>
  );
};

const description = record => {
  return (
    <div>
      {record.missingDates}
    </div>
  );
};

//columns for the model
const columns = [
  {
    title: "Date",
    dataIndex: "dateTable",
    key: "dateTable",
    fixed: "left",
    width: 70,
    className: "table",
    render: date => forecastText(date)
  },
  {
    title: "Infection Values",
    children: [
      {
        title: "Daily",
        className: "table",
        dataIndex: "dicv",
        key: "dicv",
        render: (text, record, i) => dicv(text, record, i)
      },
      {
        title: "2-Day",
        className: "table",
        dataIndex: "a2Day",
        key: "a2Day",
        render: (text, record, i) => a2Day(text, record, i)
      }
    ]
  },
  {
    title: "Accumulation Infection Values",
    children: [
      {
        title: "14-Day",
        className: "table",
        dataIndex: "a14Day",
        key: "a14Day",
        render: (text, record, i) => a14Day(text, record, i)
      },
      {
        title: "21-Day",
        className: "table",
        dataIndex: "a21Day",
        key: "a21Day",
        render: (text, record, i) => a21Day(text, record, i)
      },
      {
        title: `Season`,
        className: "table",
        dataIndex: "season",
        key: "season",
        render: (text, record, i) => season(text, record, i)
      }
    ]
  }
];

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

    const lastDay = cercosporaBeticola[cercosporaBeticola.length - 1];
    let totalMissingDays;
    if (lastDay) {
      totalMissingDays = lastDay.cumulativeMissingDays;
    }
    const missingDayList = cercosporaBeticola.filter(
      day => day.missingDay === 1
    );

    return (
      <Flex column>
        <Box>
          <h2>
            Cercospora leaf spot on table beet Prediction For {station.name}
          </h2>
        </Box>
        {totalMissingDays > 0 &&
          <Box style={{ color: "red" }}>
            <h4>
              There are {totalMissingDays} days with no data.
            </h4>
            {missingDayList.map(day => (
              <li key={day.dateTable}>{day.dateTable}</li>
            ))}
          </Box>}

        <Flex justify="center">
          <Box mt={1} col={12} lg={12} md={12} sm={12}>

            <Table
              bordered
              size={mobile ? "small" : "middle"}
              columns={columns}
              rowKey={record => record.dateTable}
              loading={ACISData.length === 0}
              pagination={false}
              dataSource={
                areRequiredFieldsSet ? takeRight(cercosporaBeticola, 8) : null
              }
              expandedRowRender={record => description(record)}
            />
          </Box>
        </Flex>
        {isGraph && <Graph />}
      </Flex>
    );
  }
}
