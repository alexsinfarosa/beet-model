import styled from "styled-components";
import flex from "styles/flex";

export const App = styled.div`
  min-height: 100vh;
  min-width: 100vw;
  background-color: ${p => p.theme.backgroundColor};
  transition: 'all 200ms linear';
  ${flex.vertical}
`;
