import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { computed } from "mobx";
import { format } from "date-fns";
import isAfter from "date-fns/is_after";

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
  @computed get data() {
    return this.props.store.app.cercosporaBeticola.slice();
  }

  @computed get firstIndexAboveZero() {
    return this.data.findIndex(day => day.a2Day > 0);
  }

  @computed get lastDayAtZero() {
    return this.data[this.firstIndexAboveZero - 1];
  }

  @computed get a2DayDataAboveZero() {
    const data = this.data.slice(this.firstIndexAboveZero);
    if (data.length < 8) {
      return this.data.slice(this.firstIndexAboveZero - 6);
    }
    return data;
  }

  @computed get lastDayAtZeroDate() {
    if (this.lastDayAtZero) return this.lastDayAtZero.dateText;
  }

  render() {
    const { currentYear } = this.props.store.app;
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
        {this.lastDayAtZeroDate &&
          isAfter(this.lastDayAtZero.date, `${currentYear}-01-10`) &&
          <h4>
            From
            {" "}
            <span style={{ color: "black" }}>
              Jannuary 1st
            </span>
            {" "}to{" "}
            <span style={{ color: "black" }}>
              {this.lastDayAtZeroDate}
            </span>
            ,{" "}2-Day values are zero
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
              data={this.a2DayDataAboveZero}
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
                {this.a2DayDataAboveZero.map((e, index) => (
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
