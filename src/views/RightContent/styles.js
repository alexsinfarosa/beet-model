import styled from "styled-components";

import Icon from "antd/lib/icon";
import "antd/lib/icon/style/css";

export const Header = styled.div`
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  background: #A05C7B;
  color: white;
  padding: 16px;
  font-size: 1.3em;
  height: 60px;
`;

export const TextIcon = styled.div`
  display: flex;
  align-items: baseline;
`;

export const IconStyled = styled(Icon)`
  color: white;
  opacity: .8;
  font-size: 1em;

  &:hover {
    opacity: 1;
  }
`;

export const MainContent = styled.div`
  flex: 1 1 auto;
  position: relative;
  overflow-y: auto;
  padding: 16px;
  width: 100%;
  max-width: 1024px;
  margin: 0 auto;
`;
