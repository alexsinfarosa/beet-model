import React, { Component } from "react";
import { inject, observer } from "mobx-react";

// antd
import Switch from "antd/lib/switch";
import "antd/lib/switch/style/css";

// components
import Subject from "components/Subject";
import State from "components/State";
import Station from "components/Station";
import DatePicker from "components/DatePicker";

import { Box } from "reflexbox";

// styled-components
import { SideBarContent } from "./styles";

@inject("store")
@observer
class SideBar extends Component {
  // toggle Map component
  toggleMap = checked => {
    // console.log(`switch to ${checked}`);
    this.props.store.app.setIsMap(checked);
    this.props.store.app.setIsSidebarOpen(false);
  };

  toggleGraph = checked => {
    // console.log(`switch to ${checked}`);
    this.props.store.app.setIsGraph(checked);
    this.props.store.app.setIsSidebarOpen(false);
  };

  render() {
    const { subject } = this.props.store.app;
    return (
      <SideBarContent>
        <Box mb={2} style={{ textAlign: "center", letterSpacing: '1px' }}>
          <h3>
            <a
              style={{ color: "red" }}
              href="http://www.cornell.edu/"
              target="_blank"
            >
              Cornell University
            </a>
          </h3>
        </Box>
        <hr/>
        <br/>
        <Subject size={this.props.size} />
        <State size={this.props.size} />
        <Station size={this.props.size} />
        <DatePicker size={this.props.size} />
        <Box mb={2}>
          <label>Display Map </label>
          <Switch
            checkedChildren="ON"
            unCheckedChildren="0FF"
            defaultChecked={true}
            onChange={this.toggleMap}
          />
        </Box>
        {subject.graph &&
          <Box mb={2}>
            <label>Display Graph </label>
            <Switch
              checkedChildren="ON"
              unCheckedChildren="0FF"
              defaultChecked={false}
              onChange={this.toggleGraph}
            />
          </Box>}
      </SideBarContent>
    );
  }
}

export default SideBar;
