import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  // margin: 5px;
  background-color: transparent;
  padding-bottom: 2.5em;
  padding-top: 1.1em;
`;

export default function FloatingElementBlock({
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
