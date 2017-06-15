import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
// import { toJS } from "mobx";

// import Select from "antd/lib/select";
// import "antd/lib/select/style/css";
// const Option = Select.Option;

@inject('store')
@observer
class Subject extends Component {
  // handleChange = value => {
  //   const { areRequiredFieldsSet } = this.props.store.app;
  //   const mobile = this.props.size;
  //   this.props.store.app.setSubject(value);
  //   if (areRequiredFieldsSet && mobile) {
  //     console.log("inside Subject");
  //     this.props.store.app.setIsSidebarOpen(false);
  //     return;
  //   }
  //   // console.log(`subject: ${value}`);
  // };
  render() {
    // const { subject, subjects } = this.props.store.app;
    return (
      <div style={{ marginBottom: '2rem' }}>
        {/* <label>Disease:</label> */}
        {/* <Select
          name="subject"
          size="large"
          autoFocus
          value={subject.name}
          placeholder="Select Disease"
          style={{ width: 200 }}
          onChange={this.handleChange}
        >
          {subjects.map((subject, i) => {
            return (
              <Option key={i} value={subject.name}>
                {subject.name}
              </Option>
            );
          })}
        </Select> */}
        <h2><i>Cercospora beticola</i></h2>
      </div>
    );
  }
}

export default Subject;
