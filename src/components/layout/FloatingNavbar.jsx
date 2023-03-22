import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  margin-top: 15px;
  // margin-left:20px;
  background-color: transparent;
  padding-top: 1.1em;
`;

export default function FloatingNavBar({
  style = undefined,
  children,
  stretchVertical = false
}) {
  return (
    <Wrapper
      style={{
        height: stretchVertical ? "calc(100% - 10px)" : undefined,
        ...style
      }}
    >
      {children}
    </Wrapper>
  );
}
