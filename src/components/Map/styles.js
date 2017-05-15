import styled from "styled-components";

import { Map } from "react-leaflet";

export const MapContainer = styled(Map)`
  width: 100%;
  height: 400px;
  z-index: 0;
  /*margin-bottom: 2rem;*/

  @media (max-width: 960px) {
    height: 350px;
  }
  @media (max-width: 768px) {
    height: 300px;
  }
  @media (max-width: 480px) {
    height: 200px;
  }
`;
