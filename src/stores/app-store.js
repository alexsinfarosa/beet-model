import { observable, action, computed } from "mobx";
import { matchIconsToStations } from "utils";
import { states } from "config/states";
import format from "date-fns/format";

export default class AppStore {
  // logic----------------------------------------------------------------------
  @observable protocol = window.location.protocol;
  @computed get areRequiredFieldsSet() {
    return (
      Object.keys(this.subject).length !== 0 &&
      Object.keys(this.state).length !== 0 &&
      Object.keys(this.station).length !== 0
    );
  }
  @observable isVisible = true;
  @action setIsVisible = () => (this.isVisible = !this.isVisible);

  @observable isCollapsed = true;
  @action setIsCollapsed = d => (this.isCollapsed = !this.isCollapsed);

  @observable isLoading = false;
  @action setIsLoading = d => (this.isLoading = d);

  @observable isMap = true;
  @action setIsMap = d => (this.isMap = d);

  @observable isGraph = false;
  @action setIsGraph = d => (this.isGraph = d);

  @observable breakpoints = {
    xs: "(max-width: 767px)",
    su: "(min-width: 768px)",
    sm: "(min-width: 768px) and (max-width: 991px)",
    md: "(min-width: 992px) and (max-width: 1199px)",
    mu: "(min-width: 992px)",
    lg: "(min-width: 1200px)"
  };
  @observable isSidebarOpen;
  @action setIsSidebarOpen = d => (this.isSidebarOpen = d);
  @action toggleSidebar = () => (this.isSidebarOpen = !this.isSidebarOpen);

  // Subject--------------------------------------------------------------
  @observable subjects = [
    {
      name: "Strawberries",
      diseases: ["botrytis", "anthracnose"],
      graph: false
    },
    { name: "Blueberries", diseases: ["Blueberrie Maggot"], graph: true }
  ];
  @observable subject = {};
  @action resetSubject = () => (this.subject = {});
  @action setSubjectFromLocalStorage = d => (this.subject = d);
  @action setSubject = d => {
    this.subject = this.subjects.find(subject => subject.name === d);
    localStorage.setItem(`berry`, JSON.stringify(this.subject));
  };

  // State----------------------------------------------------------------------
  @observable state = JSON.parse(localStorage.getItem("state")) || {};
  @action setState = stateName => {
    // localStorage.removeItem("station");
    this.station = {};
    this.state = states.filter(state => state.name === stateName)[0];
    localStorage.setItem("state", JSON.stringify(this.state));
  };

  // Station--------------------------------------------------------------------
  @observable stations = [];
  @action setStations = d => (this.stations = d);
  @computed get stationsWithMatchedIcons() {
    return matchIconsToStations(this.protocol, this.stations, this.state);
  }
  @computed get getCurrentStateStations() {
    return this.stations.filter(
      station => station.state === this.state.postalCode
    );
  }
  @observable station = JSON.parse(localStorage.getItem("station")) || {};
  @computed get getStation() {
    return this.station;
  }
  @action setStation = stationName => {
    this.station = this.stations.find(station => station.name === stationName);
    localStorage.setItem("station", JSON.stringify(this.station));
  };

  // Dates----------------------------------------------------------------------
  @observable currentYear = new Date().getFullYear().toString();
  @observable endDate = JSON.parse(localStorage.getItem("endDate")) ||
    new Date();
  @action setEndDate = d => {
    this.endDate = format(d, "YYYY-MM-DD");
    localStorage.setItem("endDate", JSON.stringify(this.endDate));
  };
  @computed get startDate() {
    return `${format(this.endDate, "YYYY")}-01-01`;
  }
  @computed get startDateYear() {
    return format(this.endDate, "YYYY");
  }

  // ACISData ------------------------------------------------------------------
  @observable ACISData = [];
  @action setACISData = d => (this.ACISData = d);

  // Strawberry model
  @observable strawberries = [];
  @action setStrawberries = d => this.strawberries.push(d);
}
