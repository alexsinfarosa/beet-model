import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import takeRight from "lodash/takeRight";

//  reflexbox
import { Flex, Box } from "reflexbox";

// styles
import "styles/table.styl";

import Table from "antd/lib/table";
import "antd/lib/table/style/css";

import Graph from "./Graph";

const forecastText = date => {
  return (
    <div>
      <div>{date.split("-")[0]}</div>
      <div style={{ fontSize: ".5rem", color: "red" }}>
        {date.split("-")[1]}
      </div>
    </div>
  );
};

const emergence = cdd => {
  if (cdd > 913) {
    return (
      <div>
        <div>{cdd}</div>
        <div style={{ fontSize: ".6rem", color: "#118EE9" }}>
          Emergence Occurred
        </div>
      </div>
    );
  }
  return cdd;
};

const columns = [
  {
    title: "Date",
    className: "table",
    dataIndex: "dateTable",
    key: "dateTable",
    fixed: "left",
    width: 60,
    render: date => forecastText(date)
  },
  {
    title: "Degree Days",
    children: [
      {
        title: "Daily",
        className: "table",
        dataIndex: "dd",
        key: "dd"
      },
      {
        title: "Cumulative",
        className: "table",
        dataIndex: "cdd",
        key: "cdd",
        render: cdd => emergence(cdd)
      }
    ]
  },
  {
    title: "Temperature (˚F)",
    children: [
      {
        title: "Min",
        className: "table",
        dataIndex: "Tmin",
        key: "Tmin"
      },
      {
        title: "Max",
        className: "table",
        dataIndex: "Tmax",
        key: "Tmax"
      },
      {
        title: "Avg",
        className: "table",
        dataIndex: "Tavg",
        key: "Tavg"
      }
    ]
  }
];

@inject("store")
@observer
export default class BlueberryMaggot extends Component {
  render() {
    const {
      ACISData,
      station,
      areRequiredFieldsSet,
      isGraph
    } = this.props.store.app;
    // const { mobile } = this.props;

    return (
      <Flex column>
        <Box>
          <h2>Blueberry Maggot Prediction For {station.name}</h2>
        </Box>

        <Flex justify="center">

          <Box mt={1} col={12} lg={12} md={12} sm={12}>

            <Table
              size="middle"
              columns={columns}
              bordered
              rowKey={record => record.date}
              loading={ACISData.length === 0}
              pagination={false}
              dataSource={areRequiredFieldsSet ? takeRight(ACISData, 8) : null}
            />
          </Box>

        </Flex>
        {isGraph && <Graph />}
      </Flex>
    );
  }
}
