import { observable, action, computed } from "mobx";
import { matchIconsToStations } from "utils";
import { states } from "utils/states";
import format from "date-fns/format";

export default class AppStore {
  // logic----------------------------------------------------------------------
  @observable protocol = window.location.protocol;
  @computed
  get areRequiredFieldsSet() {
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
  @action setIsMap = d => (this.isMap = !this.isMap);

  @observable isGraph = false;
  @action setIsGraph = d => (this.isGraph = !this.isGraph);

  @observable
  breakpoints = {
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
  @observable
  subjects = [
    {
      name: "Cercospora Beticola",
      diseases: ["Cercospora Beticola"],
      graph: true
    }
  ];
  @observable subject = {};
  @action resetSubject = () => (this.subject = {});
  @action setSubjectFromLocalStorage = d => (this.subject = d);
  @action
  setSubject = d => {
    this.subject = this.subjects.find(subject => subject.name === d);
    localStorage.setItem(`beet`, JSON.stringify(this.subject));
  };

  // State----------------------------------------------------------------------
  @observable
  state = JSON.parse(localStorage.getItem("state")) || {
    postalCode: "ALL",
    lat: 42.5,
    lon: -75.7,
    zoom: 6,
    name: "All States"
  };
  @action
  setState = stateName => {
    localStorage.removeItem("state");
    this.station = {};
    this.state = states.find(state => state.name === stateName);
    localStorage.setItem("state", JSON.stringify(this.state));
  };
  @action
  setStateFromEntireMap = d => {
    this.state = states.find(state => state.postalCode === d);
    localStorage.setItem("state", JSON.stringify(this.state));
  };

  // Station--------------------------------------------------------------------
  @observable stations = [];
  @action setStations = d => (this.stations = d);
  @computed
  get stationsWithMatchedIcons() {
    return matchIconsToStations(this.protocol, this.stations, this.state);
  }
  @computed
  get getCurrentStateStations() {
    return this.stations.filter(
      station => station.state === this.state.postalCode
    );
  }
  @observable station = JSON.parse(localStorage.getItem("station")) || {};
  @computed
  get getStation() {
    return this.station;
  }
  @action
  setStation = stationName => {
    localStorage.removeItem("station");
    this.station = this.stations.find(station => station.name === stationName);
    localStorage.setItem("station", JSON.stringify(this.station));
  };

  // Dates----------------------------------------------------------------------
  @observable currentYear = new Date().getFullYear().toString();
  @observable
  endDate = JSON.parse(localStorage.getItem("endDate")) || new Date();
  @action
  setEndDate = d => {
    this.endDate = format(d, "YYYY-MM-DD");
    localStorage.setItem("endDate", JSON.stringify(this.endDate));
  };
  @computed
  get startDate() {
    return `${format(this.endDate, "YYYY")}-01-01`;
  }
  @computed
  get startDateYear() {
    return format(this.endDate, "YYYY");
  }

  // ACISData ------------------------------------------------------------------
  @observable ACISData = [];
  @action setACISData = d => (this.ACISData = d);

  @observable cercosporaBeticola = [];
  @action resetCercospora = () => (this.cercosporaBeticola = []);
  @action setCercosporaBeticola = d => this.cercosporaBeticola.push(d);
  @computed
  get displayPlusButton() {
    return this.ACISData.filter(e => e.missingDay).length > 0;
  }

  @observable barColor;
  @action setBarColor = d => (this.barColor = d);

  @observable CSVData = [];
  @action
  setCSVData() {
    this.cercosporaBeticola.forEach(obj => {
      const picked = (({ date, dicv, a2Day, a14Day, a21Day, season }) => ({
        date,
        dicv,
        a2Day,
        a14Day,
        a21Day,
        season
      }))(obj);
      this.CSVData.push(picked);
    });
  }
}
