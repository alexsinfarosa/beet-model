import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { when } from "mobx";

// components
import Home from "views/Home";
import Test from "components/Test";

// api
import { fetchAllStations } from "utils/api";

@inject("store")
@observer
class App extends Component {
  constructor(props) {
    super(props);
    const protocol = this.props.store.app.protocol;
    when(
      // once...
      () => this.props.store.app.stations.length === 0,
      // ... then
      () =>
        fetchAllStations(protocol).then(allStations =>
          this.props.store.app.setStations(allStations)
        )
    );
  }

  render() {
    return (
      <div>
        <Home />
        <Test />
      </div>
    );
  }
}

export default App;
