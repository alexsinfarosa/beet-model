import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { format } from "date-fns";
// import findLast from "lodash/findLast";
import findLastIndex from "lodash/findLastIndex";
import addDays from "date-fns/add_days";

import { Flex, Box } from "reflexbox";

import {
  ComposedChart,
  Cell,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import CustomLabel from "./CustomLabel";

// styled-components
import { StyledTooltip } from "./styles";

@inject("store")
@observer
export default class Graph extends Component {
  render() {
    const { cercosporaBeticola } = this.props.store.app;

    // Potential bug. Chartjs needs a javascript array
    let a2DayDataAboveZero;
    const data = cercosporaBeticola.map(e => e);
    const firstIndexAboveZero = data.findIndex(day => day.a2Day > 0);
    const lastDayAtZero = data[firstIndexAboveZero - 1];

    const lastIndexAboveZero = findLastIndex(data, day => day.a2Day > 0);
    const firstDayAtZero = data[lastIndexAboveZero];
    console.log(firstDayAtZero);

    a2DayDataAboveZero = data.slice(
      firstIndexAboveZero,
      lastIndexAboveZero + 1
    );
    if (a2DayDataAboveZero.length < 14) {
      a2DayDataAboveZero = data.slice(firstIndexAboveZero - 1);
    }

    // Change the aspect ratio when viewed on different devices
    let aspect;
    const w = window.innerWidth;
    if (w >= 0 && w <= 401) {
      aspect = 1;
    } else if (w > 401 && w <= 768) {
      aspect = 1.5;
    } else {
      aspect = 2;
    }

    const renderTooltip = props => {
      const { payload, label, active } = props;
      if (active === true) {
        // console.log(props);
        return (
          <StyledTooltip>
            <h5>{format(label, "MMMM Do")}</h5>
            <p style={{ color: payload[0].payload.colorBar }}>
              {`2-Day Infection Values: ${payload[0].value}`}
            </p>
          </StyledTooltip>
        );
      }
    };

    return (
      <Flex mt={4} mb={4} column>
        <h2>2-Day Infection Values Graph</h2>
        <br />
        {firstDayAtZero &&
          <h4>
            From
            {" "}
            <span style={{ color: "black" }}>
              Jannuary 1st
            </span>
            {" "}to{" "}
            <span style={{ color: "black" }}>
              {lastDayAtZero.dateText}
            </span>
            {" "} and from {" "}
            <span style={{ color: "black" }}>
              {/* {addDays(firstDayAtZero.dateText, 1)} */}
            </span>
            {" "} to {" "}
            <span style={{ color: "black" }}>
              Dicember 31st,
            </span>
            {" "} 2-Day values are zero
          </h4>}
        <br />
        <Box
          mt={3}
          col={12}
          lg={12}
          md={12}
          sm={12}
          style={{ margin: "0 auto" }}
        >
          <ResponsiveContainer width="100%" aspect={aspect}>
            <ComposedChart
              data={a2DayDataAboveZero}
              margin={{ top: 0, right: 20, left: -30, bottom: 5 }}
            >
              <XAxis dataKey="dateGraph" tick={<CustomLabel />} />
              <YAxis
                dataKey="a2Day"
                allowDecimals={false}
                domain={["dataMin", "dataMax"]}
              />
              <Tooltip content={renderTooltip} offset={20} />
              <Legend
                align="right"
                verticalAlign="top"
                height={48}
                iconSize={18}
                iconType="rect"
                payload={[
                  { value: "Low", type: "rect", color: "#81C784" },
                  { value: "Moderate", type: "rect", color: "#FCCE00" },
                  { value: "High", type: "rect", color: "#F44336" }
                ]}
              />
              <Bar dataKey="a2Day">
                {a2DayDataAboveZero.map((e, index) => (
                  <Cell
                    key={`cell-${index}`}
                    cursor="pointer"
                    fill={e.colorBar}
                  />
                ))}
              </Bar>

            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </Flex>
    );
  }
}
