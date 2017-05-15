import React, { Component } from "react";
import { inject, observer } from "mobx-react";

// components
import Map from "components/Map";
import CercosporaBeticola from "models/CercosporaBeticola";

// styled-components
import { Header, TextIcon, IconStyled, MainContent } from "./styles";

@inject("store")
@observer
class RightContent extends Component {
  render() {
    const { areRequiredFieldsSet, isMap, toggleSidebar } = this.props.store.app;
    return (
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        {this.props.mobile
          ? <Header>
              <TextIcon>
                <IconStyled
                  type="menu-unfold"
                  onClick={toggleSidebar}
                  style={{ marginRight: 10 }}
                />
                <div>Beet Model</div>
              </TextIcon>
              <div>NEWA</div>
            </Header>
          : <Header>
              <div>Beet Model</div>
              <div>NEWA</div>
            </Header>}

        <MainContent>
          {isMap && <Map />}
          {areRequiredFieldsSet && <CercosporaBeticola {...this.props} />}
        </MainContent>
      </div>
    );
  }
}

export default RightContent;
