import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { when } from "mobx";
// import { DatePicker } from "antd";
import DatePicker from "antd/lib/date-picker";
import "antd/lib/date-picker/style/css";
import moment from "moment";

@inject("store")
@observer
class Subject extends Component {
  constructor(props) {
    super(props);
    when(
      () => this.props.store.app.endDate === null,
      () => this.props.store.app.setEndDate(moment())
    );
  }

  onChange = (date, dateString) => {
    const { areRequiredFieldsSet } = this.props.store.app;
    const mobile = this.props.size;
    // console.log(date, dateString);
    this.props.store.app.setEndDate(dateString);
    if (areRequiredFieldsSet && mobile) {
      console.log("inside DatePicker");
      this.props.store.app.setIsSidebarOpen(false);
      return;
    }
  };

  render() {
    const { endDate } = this.props.store.app;
    return (
      <div style={{ marginBottom: "2rem" }}>
        <label>Date:</label>
        <div><small>Start Date: January 1st</small></div>

        <DatePicker
          style={{ width: 200 }}
          size="large"
          allowClear={false}
          value={moment(endDate)}
          format="MMM DD YYYY"
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default Subject;
