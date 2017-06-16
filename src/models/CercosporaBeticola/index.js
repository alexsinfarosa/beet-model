import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import takeRight from 'lodash/takeRight';
import { autorun } from 'mobx';

import 'styles/shared.styl';
import { Flex, Box } from 'reflexbox';

import Table from 'antd/lib/table';
import 'antd/lib/table/style/css';

// components
import Graph from './Graph';

// styled-components
import { RiskLevel, Value, Info } from './styles';

// To display the 'forecast text' and style the cell
const forecastText = date => {
  return (
    <Flex justify="center" align="center" column>
      <Value>
        {date.split('-')[0]}
      </Value>

      <Info>
        {date.split('-')[1]}
      </Info>
    </Flex>
  );
};

const dicv = (text, record, i) => {
  return (
    <Flex justify="center" align="center">
      <Value>
        {record.missingDay ? 'No data' : text}
      </Value>
    </Flex>
  );
};

const a2Day = (text, record, i) => {
  if (record.missingDay === 1) {
    return (
      <Flex justify="center" align="center">
        <Value>
          No data
        </Value>
      </Flex>
    );
  }
  return (
    <Flex justify="center" align="center">
      <Value style={{ color: record.colorBar }}>
        {text}
      </Value>
      <RiskLevel
        style={{
          background: record.colorBar,
          marginLeft: '10px',
          color: 'white',
          padding: '2px 4px',
          borderRadius: '5px'
        }}
      >
        {record.a2DayIR}
      </RiskLevel>
    </Flex>
  );
};

const a14Day = (text, record, i) => {
  if (record.missingDay === 1) {
    return (
      <Flex justify="center" align="center">
        <Value>
          No data
        </Value>
      </Flex>
    );
  }

  if (record.missingDay === 0) {
    if (record.a14DayMissingDays > 0) {
      return (
        <Flex justify="center" align="center">
          <Value auto>
            {text}
          </Value>
          <Info>
            (+{record.a14DayMissingDays})
          </Info>
        </Flex>
      );
    }
    return (
      <Flex justify="center" align="center">
        <Value>
          {text}
        </Value>
      </Flex>
    );
  }
};

const a21Day = (text, record, i) => {
  if (record.missingDay === 1) {
    return (
      <Flex justify="center" align="center">
        <Value>
          No data
        </Value>
      </Flex>
    );
  }

  if (record.missingDay === 0) {
    if (record.a21DayMissingDays > 0) {
      return (
        <Flex justify="center" align="center">
          <Value auto>
            {text}
          </Value>
          <Info>
            (+{record.a21DayMissingDays})
          </Info>
        </Flex>
      );
    }
    return (
      <Flex justify="center" align="center">
        <Value>
          {text}
        </Value>
      </Flex>
    );
  }
};

const season = (text, record, i) => {
  if (record.missingDay === 1)
    return (
      <Flex justify="center" align="center">
        <Value>
          No data
        </Value>
      </Flex>
    );
  if (record.missingDay === 0) {
    if (record.cumulativeMissingDays > 0) {
      return (
        <Flex justify="center" align="center">
          <Value auto>
            {text}
          </Value>
          <Info>
            (+{record.cumulativeMissingDays})
          </Info>
        </Flex>
      );
    }
    return (
      <Flex justify="center" align="center">
        <Value>
          {text}
        </Value>
      </Flex>
    );
  }
};

const description = record => {
  if (record.missingDates.length > 0) {
    return (
      <Flex style={{ fontSize: '.6rem' }} column>
        <Box col={12} lg={6} md={6} sm={12}>
          <Box col={12} lg={12} md={12} sm={12}>
            {record.missingDates.length > 1
              ? <div>
                  No data available for the following
                  {' '}
                  {record.cumulativeMissingDays}
                  {' '}
                  dates:
                  {' '}
                </div>
              : <div>No data available for the following date:</div>}
          </Box>
        </Box>
        <br />
        <Box col={12} lg={6} md={6} sm={12}>
          {record.missingDates.map((date, i) =>
            <div key={i}>
              - {date}
            </div>
          )}
        </Box>
      </Flex>
    );
  }
  return null;
};

//columns for the model
const columns = [
  {
    title: 'Date',
    dataIndex: 'dateTable',
    key: 'dateTable',
    className: 'table',
    render: date => forecastText(date)
  },
  {
    title: 'Infection Values',
    children: [
      {
        title: 'Daily',
        className: 'table',
        dataIndex: 'dicv',
        key: 'dicv',
        render: (text, record, i) => dicv(text, record, i)
      },
      {
        title: '2-Day/Risk',
        className: 'table',
        dataIndex: 'a2Day',
        key: 'a2Day',
        render: (text, record, i) => a2Day(text, record, i)
      }
    ]
  },
  {
    title: 'Accumulated Infection Values',
    children: [
      {
        title: '14-Day',
        className: 'table',
        dataIndex: 'a14Day',
        key: 'a14Day',
        render: (text, record, i) => a14Day(text, record, i)
      },
      {
        title: '21-Day',
        className: 'table',
        dataIndex: 'a21Day',
        key: 'a21Day',
        render: (text, record, i) => a21Day(text, record, i)
      },
      {
        title: `Season`,
        className: 'table',
        dataIndex: 'season',
        key: 'season',
        render: (text, record, i) => season(text, record, i)
      }
    ]
  }
];

@inject('store')
@observer
export default class CercosporaBeticola extends Component {
  constructor(props) {
    super(props);
    autorun(() => this.createDataModel());
  }

  createDataModel = () => {
    this.props.store.app.resetCercospora();
    const { ACISData } = this.props.store.app;
    const data = {};
    let a2Day = 0;
    let season = 0;
    let description = [];
    let a14Day = 0;
    let a21Day = 0;

    for (const [i, day] of ACISData.entries()) {
      // determine a2Day
      if (i === 0) {
        a2Day = day.dicv;
      } else {
        a2Day = day.dicv + ACISData[i - 1].dicv;
      }

      // a2Day Infection Risk
      let a2DayIR = '';
      let color = '';
      let colorBar = '';
      if (a2Day >= 0 && a2Day <= 3) {
        a2DayIR = 'Low';
        color = 'low';
        colorBar = '#81C784';
      } else if (a2Day >= 4 && a2Day <= 6) {
        a2DayIR = 'Moderate';
        color = 'moderate';
        colorBar = '#FCCE00';
      } else {
        a2DayIR = 'High';
        color = 'high';
        colorBar = '#F44336';
      }

      // 14-Day Accumulation Infection Values
      let a14DayArr = 0;
      // let a14Day = 0;
      let a14DayMissingDaysArr = 0;
      let a14DayMissingDays = 0;
      if (i < 14) {
        a14Day += day.dicv;
      } else {
        a14DayArr = ACISData.slice(i - 14, i + 1).map(e => e.dicv);
        a14Day = a14DayArr.reduce((acc, val) => acc + val, 0);
        a14DayMissingDaysArr = ACISData.slice(i - 14, i + 1).map(
          e => e.missingDay
        );
        a14DayMissingDays = a14DayMissingDaysArr.reduce(
          (acc, val) => acc + val,
          0
        );
      }
      // console.log(day.dateTable, a14DayArr, a14Day)

      // 21-Day Accumulation Infection Values
      let a21DayArr = 0;
      // let a21Day = 0;
      let a21DayMissingDaysArr = 0;
      let a21DayMissingDays = 0;
      if (i < 21) {
        a21Day += day.dicv;
      } else {
        a21DayArr = ACISData.slice(i - 21, i + 1).map(e => e.dicv);
        a21Day = a21DayArr.reduce((acc, val) => acc + val, 0);
        a21DayMissingDaysArr = ACISData.slice(i - 21, i + 1).map(
          e => e.missingDay
        );
        a21DayMissingDays = a21DayMissingDaysArr.reduce(
          (acc, val) => acc + val,
          0
        );
      }

      // Description
      if (day.missingDay === 1) {
        description.push(day.dateText);
      }

      // Season Total Infection Values
      season += day.dicv;

      // building the object
      data['date'] = day.date;
      data['dateTable'] = day.dateTable;
      data['dateGraph'] = day.dateGraph;
      data['dateText'] = day.dateText;
      data['dicv'] = parseInt(day.dicv, 10);
      data['a2Day'] = parseInt(a2Day, 10);
      data['a2DayIR'] = a2DayIR;
      data['color'] = color;
      data['colorBar'] = colorBar;
      data['a14Day'] = parseInt(a14Day, 10);
      data['a14DayMissingDays'] = a14DayMissingDays;
      data['a21Day'] = parseInt(a21Day, 10);
      data['a21DayMissingDays'] = a21DayMissingDays;
      data['season'] = parseInt(season, 10);
      data['missingDay'] = day.missingDay;
      data['cumulativeMissingDays'] = day.cumulativeMissingDays;
      data['missingDates'] = description;
      this.props.store.app.setCercosporaBeticola(data);
    }
  };

  render() {
    const {
      ACISData,
      station,
      state,
      areRequiredFieldsSet,
      cercosporaBeticola,
      isGraph,
      displayPlusButton
    } = this.props.store.app;
    const { mobile } = this.props;

    return (
      <Flex column>
        <Box>
          {!mobile
            ? <h2>
                <i>Cercospora</i> leaf spot on table beet prediction for
                {' '}
                <span style={{ color: '#A05C7B' }}>
                  {station.name}, {state.postalCode}
                </span>
              </h2>
            : <h3>
                <i>Cercospora</i> leaf spot on table beet prediction for
                {' '}
                <span style={{ color: '#A05C7B' }}>
                  {station.name}, {state.postalCode}
                </span>
              </h3>}
        </Box>

        <Flex justify="center">
          <Box mt={1} col={12} lg={12} md={12} sm={12}>
            {displayPlusButton
              ? <Table
                  bordered
                  size={mobile ? 'small' : 'middle'}
                  columns={columns}
                  rowKey={record => record.dateTable}
                  loading={ACISData.length === 0}
                  pagination={false}
                  dataSource={
                    areRequiredFieldsSet
                      ? takeRight(cercosporaBeticola, 8)
                      : null
                  }
                  expandedRowRender={record => description(record)}
                />
              : <Table
                  bordered
                  size={mobile ? 'small' : 'middle'}
                  columns={columns}
                  rowKey={record => record.dateTable}
                  loading={ACISData.length === 0}
                  pagination={false}
                  dataSource={
                    areRequiredFieldsSet
                      ? takeRight(cercosporaBeticola, 8)
                      : null
                  }
                />}
          </Box>
        </Flex>
        {isGraph && <Graph />}
      </Flex>
    );
  }
}
