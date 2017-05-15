import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { when } from "mobx";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

// styled-components

// components
import Home from "views/Home";

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
    // const repo = `/${window.location.pathname.split("/")[1]}`;
    // console.log(repo);
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route render={() => <h1>Page Not Found!</h1>} />
        </Switch>
      </Router>
    );
  }
}

export default App;
