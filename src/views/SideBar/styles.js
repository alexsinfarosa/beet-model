import styled from 'styled-components';

export const SideBarContent = styled.div`
  background: white;
  padding: 16px;
  width: 232px;
  height: ${props => (props.size ? '130vh' : '100vh')};
  position: relative;
  z-index: 1000;
`;

export const RiskLevel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 18px;
  border-radius: 5px;
  font-size: .6rem;
  letter-spacing: 1px;
  color: white;
  width: 55px;
  background: ${props => (props.color ? props.color : '#333')};
`;
