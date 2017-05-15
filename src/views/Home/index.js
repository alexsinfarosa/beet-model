import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { autorun } from "mobx";
import { MatchMediaProvider } from "mobx-react-matchmedia";

// react-sidebar
import Main from "react-sidebar";
import RightContent from "views/RightContent";
import SideBar from "views/SideBar";

// utility functions
import { getData } from "../../utils";

// const mql = window.matchMedia(`(min-width: 800px)`);

@inject("store")
@observer
export default class Home extends Component {
  constructor(props) {
    super(props);

    this.props.store.app.setSubjectFromLocalStorage(
      JSON.parse(localStorage.getItem("berry")) || {}
    );
    autorun(() => this.runMainFunction());
  }

  runMainFunction = () => {
    const {
      protocol,
      getStation,
      startDate,
      endDate,
      currentYear,
      startDateYear,
      areRequiredFieldsSet
    } = this.props.store.app;
    if (areRequiredFieldsSet) {
      this.props.store.app.setACISData([]);
      return getData(
        protocol,
        getStation,
        startDate,
        endDate,
        currentYear,
        startDateYear
      ).then(data => this.props.store.app.setACISData(data));
    }
  };

  render() {
    const {
      setIsSidebarOpen,
      isSidebarOpen,
      breakpoints
    } = this.props.store.app;
    return (
      <MatchMediaProvider breakpoints={breakpoints}>
        <Main
          sidebar={<SideBar size={breakpoints.xs} />}
          docked={breakpoints.su ? true : false}
          open={isSidebarOpen}
          onSetOpen={d => setIsSidebarOpen(d)}
        >
          <RightContent mobile={breakpoints.xs} />
        </Main>
      </MatchMediaProvider>
    );
  }
}
