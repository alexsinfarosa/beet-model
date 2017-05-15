import React, { Component } from "react";
import { inject, observer } from "mobx-react";
// import { Select } from "antd";
import Select from "antd/lib/select";
import "antd/lib/select/style/css";
const Option = Select.Option;

// Utilities
import { states } from "config/states";

@inject("store")
@observer
class State extends Component {
  handleChange = value => {
    this.props.store.app.setState(value);
  };
  render() {
    const { state } = this.props.store.app;
    const stateList = states.map(state => (
      <Option key={state.postalCode} value={state.name}>{state.name}</Option>
    ));
    return (
      <div style={{ marginBottom: "2rem" }}>
        <label>State:</label>
        <Select
          name="state"
          size="large"
          value={state.name}
          placeholder="Select State"
          style={{ width: 200 }}
          onChange={this.handleChange}
        >
          {stateList}
        </Select>
      </div>
    );
  }
}

export default State;
