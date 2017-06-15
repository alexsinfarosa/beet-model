import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

// antd
// import Switch from "antd/lib/switch";
// import "antd/lib/switch/style/css";

import Button from 'antd/lib/button';
import 'antd/lib/button/style/css';

// components
import Subject from 'components/Subject';
import State from 'components/State';
import Station from 'components/Station';
import DatePicker from 'components/DatePicker';

import { Flex, Box } from 'reflexbox';
import { RiskLevel } from './styles';

// styled-components
import { SideBarContent } from './styles';

@inject('store')
@observer
class SideBar extends Component {
  // toggle Map component
  toggleMap = () => {
    // console.log(`switch to ${checked}`);
    this.props.store.app.setIsMap();
    this.props.store.app.setIsSidebarOpen(false);
  };

  toggleGraph = () => {
    // console.log(`switch to ${checked}`);
    this.props.store.app.setIsGraph();
    this.props.store.app.setIsSidebarOpen(false);
  };

  render() {
    const { subject, isGraph, isMap } = this.props.store.app;
    return (
      <SideBarContent>
        <Box mb={2} style={{ textAlign: 'center', letterSpacing: '1px' }}>
          <h3>
            <a
              style={{ color: '#B31B1B' }}
              href="http://www.cornell.edu/"
              target="_blank"
            >
              Cornell University
            </a>
          </h3>
        </Box>
        <hr />
        <br />
        <Subject size={this.props.size} />
        <State size={this.props.size} />
        <Station size={this.props.size} />
        <DatePicker size={this.props.size} />

        <Box mb={2} mt={2}>
          <Button size="large" icon="environment-o" onClick={this.toggleMap}>
            {isMap ? 'Hide Map' : 'Display Map'}
          </Button>
        </Box>

        {subject.graph &&
          <Box>
            <Button size="large" icon="bar-chart" onClick={this.toggleGraph}>
              {isGraph ? 'Hide Graph' : 'Display Graph'}
            </Button>
          </Box>}
        <br />

        <br />
        <h4>2-Day risk levels</h4>
        <Flex mt={2} mb={2}>
          <RiskLevel color="#81C784">Low</RiskLevel>
          <Box ml={1}>Between 0 and 3</Box>
        </Flex>
        <Flex mt={2} mb={2}>
          <RiskLevel color="#FCCE00">Moderate</RiskLevel>
          <Box ml={1}>Between 4 and 6</Box>
        </Flex>
        <Flex mt={2} mb={2}>
          <RiskLevel color="#F44336">High</RiskLevel>
          <Box ml={1}>Above 6</Box>
        </Flex>
      </SideBarContent>
    );
  }
}

export default SideBar;
