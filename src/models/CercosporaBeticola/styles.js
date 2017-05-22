import styled from "styled-components";
import {Box} from 'reflexbox';


export const RiskLevel = styled(Box)`
  font-size: .6rem;

  @media (max-width: 992px) {
    font-size: .5rem;
  }
  @media (max-width: 768px) {
    font-size: .4rem;

  }
  @media (max-width: 319px) {
    font-size: .3rem;

  }
`;

export const Value = styled(Box)`
  font-size: .7rem;

  @media (max-width: 992px) {
    font-size: .6rem;
  }
  @media (max-width: 768px) {
    font-size: .5rem;
  }
  @media (max-width: 319px) {
    font-size: .4rem;
  }

`
export const Info = styled(Box)`
  margin-left: 3px;
  color: red;
  font-size: .7rem;

  @media (max-width: 992px) {
    font-size: .6rem;
  }
  @media (max-width: 768px) {
    font-size: .5rem;
  }
  @media (max-width: 319px) {
    font-size: .4rem;
  }

`
