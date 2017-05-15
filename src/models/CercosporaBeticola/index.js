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

const noData = data => {
  if (data === "No Data") {
    return <span style={{ fontSize: ".6rem", color: "red" }}>No Data</span>;
  }
  return data;
};

const riskLevel = (text, record, i) => {
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

// columns for the model
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
        key: "dicv"
      },
      {
        title: "2-Day",
        className: "table",
        dataIndex: "a2Day",
        key: "a2Day",
        render: (text, record, i) => riskLevel(text, record, i)
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
        render: data => noData(data)
      },
      {
        title: "21-Day",
        className: "table",
        dataIndex: "a21Day",
        key: "a21Day",
        render: data => noData(data)
      },
      {
        title: `Season`,
        className: "table",
        dataIndex: "season",
        key: "season"
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
    for (const [i, day] of ACISData.entries()) {
      // determine a2Day
      if (i > 0) {
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
      const a14Day = ACISData.slice(i - 14, i).map(e => e.dicv);
      // 21-Day Accumulation Infection Values
      const a21Day = ACISData.slice(i - 21, i).map(e => e.dicv);
      // Season Total Infection Values
      season += day.dicv;

      // building the object
      data["dateTable"] = day.dateTable;
      data["dateGraph"] = day.dateGraph;
      data["dateText"] = day.dateText;
      data["dicv"] = day.missingDay ? "No data" : parseInt(day.dicv, 10);
      data["a2Day"] = parseInt(a2Day, 10);
      data["a2DayIR"] = a2DayIR;
      data["color"] = color;
      data["colorBar"] = colorBar;
      data["a14Day"] = day.missingDay ? "No data" : parseInt(a14Day[13], 10);
      data["a21Day"] = day.missingDay ? "No data" : parseInt(a21Day[20], 10);
      data["season"] = day.missingDay ? "No data" : parseInt(season, 10);
      data["missingDay"] = day.missingDay;
      data["cumulativeMissingDays"] = day.cumulativeMissingDays;
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
      day => day.missingDay === true
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
            />
          </Box>
        </Flex>
        {isGraph && <Graph />}
      </Flex>
    );
  }
}
