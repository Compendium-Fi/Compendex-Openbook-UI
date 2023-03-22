import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  margin: 5px;
   padding: 5px;
  // background-color: #1a2029;
`;

export default function FloatingElement({
  style = {},
  children,
  stretchVertical = false,
  className = ""
}) {
  return (
    <Wrapper
      style={{
        height: stretchVertical ? "calc(100% - 10px)" : undefined,
        ...style
      }}
      className={className}
    >
      {children}
    </Wrapper>
  );
}
