import React, { Component } from "react";
import { inject, observer } from "mobx-react";
// import { toJS } from "mobx";

// data to test
// import { data } from "./testData";

@inject("store")
@observer
export default class Test extends Component {
  render() {
    return <div />;
  }
}
