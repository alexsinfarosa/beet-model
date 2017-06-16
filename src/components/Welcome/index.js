import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { Flex, Box } from 'reflexbox';

@inject('store')
@observer
export default class Welcome extends Component {
  render() {
    return (
      <Flex justify="center" align="center" column>
        <h1>Welcome to NEWA!</h1>
        <br />
        <h2>
          Complete the selection from the panel on the left.
        </h2>
      </Flex>
    );
  }
}
