import styled from "styled-components";

export const RiskLevel = styled.span`
  display: inline-block;
  font-size: .8rem;
  color: white;
  width: 60px;
  padding: 1px;
  margin-left: 10px;
  border-radius: 5px;
  text-align: center;

  @media (max-width: 992px) {
    font-size: 0.8rem;
    width: 60px;
  }
  @media (max-width: 768px) {
    font-size: 0.7rem;
    width: 50px;
  }
  @media (max-width: 400px) {
    font-size: 0.5rem
    width: 40px;
  }
`;
