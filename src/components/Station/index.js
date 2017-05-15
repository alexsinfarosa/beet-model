import React, { Component } from "react";
import { inject, observer } from "mobx-react";
// import { toJS } from "mobx";
// import { Select } from "antd";
import Select from "antd/lib/select";
import "antd/lib/select/style/css";
const Option = Select.Option;

// Utilities
// import { states } from "../states";

@inject("store")
@observer
class State extends Component {
  handleChange = async value => {
    const mobile = this.props.size;
    await this.props.store.app.setStation(value);

    if (this.props.store.app.areRequiredFieldsSet && mobile) {
      this.props.store.app.setIsSidebarOpen(false);
      return;
    }
  };
  render() {
    const { getCurrentStateStations, getStation } = this.props.store.app;

    const stationList = getCurrentStateStations.map(station => (
      <Option key={`${station.id} ${station.network}`} value={station.name}>
        {station.name}
      </Option>
    ));

    return (
      <div style={{ marginBottom: "2rem" }}>
        <label>Station:</label>
        <Select
          name="station"
          size="large"
          value={getStation.name}
          placeholder={`Select Station (${getCurrentStateStations.length})`}
          style={{ width: 200 }}
          onChange={this.handleChange}
        >
          {stationList}
        </Select>
      </div>
    );
  }
}

export default State;
