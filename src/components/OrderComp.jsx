import { Col, Row } from "antd";
import React from "react";
import styled, { css } from "styled-components";

import FloatingElementBlock from "../Serum/components/layout/FloatingElementBlock";

const SizeTitle = styled(Row)`
  /* padding: 0px 0 14px; */
  color: #acacad;
`;

const Line = styled.div`
  text-align: left;
  float: left;
  height: 100%;
  ${(props) =>
    props["data-width"] &&
    css`
      width: ${props["data-width"]};
    `}
  ${(props) =>
    props["data-bgcolor"] &&
    css`
      background-color: ${props["data-bgcolor"]};
    `}
`;

const Price = styled.div`
  position: absolute;
  right: 5px;
  color: white;
  top: 5px;
`;

export default function OrderComp({ smallScreen, depth = 7, onPrice, onSize }) {
  return (
    <FloatingElementBlock
      className="order_book new-background"
      style={
        smallScreen
          ? {
              flex: 1,

              padding: "0 !important",

              borderRadius: "10px",
              background: "rgb(255,255,255)",

              minHeight: "545px"
            }
          : {
              overflow: "hidden",

              boxSizing: "border-box",

              background: "rgb(255,255,255)",

              minWidth: "695px",
              height: "560px",
              borderRadius: "10px",
              margin: "0.7em"
            }
      }
    >
      <SizeTitle
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center"
        }}
        className="remove-padding"
      >
        <Col
          style={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: "10px",
            lineHeight: "24px",

            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#808191"
          }}
        >
          PRICE
        </Col>
        <Col
          style={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: "10px",
            lineHeight: "24px",

            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#808191"
          }}
        >
          AMOUNT
        </Col>
        <Col
          style={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: "10px",
            lineHeight: "24px",

            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#808191"
          }}
        >
          {/* TOTAL ({quoteCurrency}) */}
        </Col>
      </SizeTitle>
      <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
        {orderbookData?.asks.map(({ price, size, sizePercent }) => (
          <OrderbookRow
            key={price + ""}
            price={price}
            size={size}
            side={"sell"}
            sizePercent={sizePercent}
            onPriceClick={() => onPrice(price)}
            onSizeClick={() => onSize(size)}
          />
        ))}
        <MarkPriceComponent
          markPrice={markPrice}
          baseCurrency={quoteCurrency}
        />
        {orderbookData?.bids.map(({ price, size, sizePercent }) => (
          <OrderbookRow
            key={price + ""}
            price={price}
            size={size}
            side={"buy"}
            sizePercent={sizePercent}
            onPriceClick={() => onPrice(price)}
            onSizeClick={() => onSize(size)}
          />
        ))}
      </div>
    </FloatingElementBlock>
  );
}

const OrderbookRow = React.memo(
  ({ side, price, size, sizePercent, onSizeClick, onPriceClick }) => {
    return (
      <Row
        style={{
          marginBottom: 1,
          paddingLeft: "0.2em",
          paddingRight: "0.2em",
          height: "31px"
        }}
      >
        <Col
          span={8}
          style={{
            textAlign: "left",
            alignItems: "flex-start"
          }}
        >
          <Price
            style={{
              color:
                side === "buy"
                  ? "rgba(61, 186, 162, 1)"
                  : "rgba(255, 122, 104, 1)",
              left: 20,
              fontFamily: "Inter",
              fontStyle: "normal",
              fontWeight: 500,
              fontSize: "12px",
              lineHeight: "16px"
            }}
          >
            {/* {formattedPrice} */}
          </Price>
          <Line
            data-width={sizePercent + "%"}
            data-bgcolor={
              side === "buy"
                ? "rgba(61, 186, 162, 0.4)"
                : "rgba(255, 122, 104, 0.4)"
            }
          />
        </Col>
        <Col
          span={8}
          style={{
            textAlign: "center",
            fontFamily: "Inter",
            fontStyle: "normal",
            fontWeight: 500,
            fontSize: "12px",
            lineHeight: "16px",
            marginTop: "10px"
          }}
        >
          {/* {formattedSize} */}
        </Col>
        <Col
          span={8}
          style={{
            textAlign: "center",
            fontFamily: "Inter",
            fontStyle: "normal",
            fontWeight: 500,
            fontSize: "12px",
            lineHeight: "16px",
            marginTop: "10px"
          }}
        ></Col>
      </Row>
    );
  }
);
