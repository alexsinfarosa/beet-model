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
              <div>
                <div style={{textAlign: 'right'}}>NEWA</div>
                <div style={{ fontSize: ".7rem", letterSpacing: '1px' }}>
                  Network for Environment and Weather Applications
                </div>
              </div>
            </Header>}


        <MainContent>
          {isMap && <Map {...this.props} />}
          {areRequiredFieldsSet && <CercosporaBeticola {...this.props} />}
        </MainContent>
      </div>
    );
  }
}

export default RightContent;
