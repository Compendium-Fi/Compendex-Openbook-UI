import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Col, Row } from "antd";
import React, { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { useMarket, useMarkPrice, useOrderbook } from "../utils/markets";
import { useInterval } from "../utils/useInterval";
import usePrevious from "../utils/usePrevious";
import { getDecimalCount, isEqual } from "../utils/utils";
import FloatingElementBlock from "./layout/FloatingElementBlock";

const Title = styled.div`
  color: rgba(255, 255, 255, 1);
  margin-bottom: 1.2em;
`;

const SizeTitle = styled(Row)`
  padding: 0px 0 14px;
  color: rgba(241, 241, 241, 0.5);
`;

const MarkPriceTitle = styled(Row)`
  padding: 8px 0 14px;
  font-weight: 400;
  border-top: 1px solid rgba(51, 66, 87, 0.6);
  border-bottom: 1px solid rgba(51, 66, 87, 0.6);
`;

const BuyLine = styled.div`
  text-align: left;
  float: left;
  height: 100%;
  ${(props) =>
    props["data-width"] &&
    css`
      width: ${props["data-width"]};
    `}
  ${(props) =>
    // props["data-bgcolor"] &&
    css`
      background: linear-gradient(
        to right,
        rgba(50, 205, 153, 1),
        rgba(50, 205, 153, 1) 0%,
        rgba(50, 205, 153, 0) 100%
      );
    `}
  
  }
`;
const SellLine = styled.div`
  text-align: left;
  float: left;
  height: 100%;
  ${(props) =>
    props["data-width"] &&
    css`
      width: ${props["data-width"]};
    `}
  ${(props) =>
    // props["data-bgcolor"] &&
    css`
      background: linear-gradient(
        to right,
        rgba(221, 80, 151, 1),
        rgba(221, 80, 151, 1) 0%,
        rgba(50, 205, 153, 0) 100%
      );
    `}
  
  }
`;
// background-color: ${props["data-bgcolor"]};
const Price = styled.div`
  position: absolute;
  right: 5px;
  color: white;
  top: 5px;
`;

export default function Orderbook({ smallScreen, depth = 7, onPrice, onSize }) {
  const markPrice = useMarkPrice();
  const [orderbook] = useOrderbook();
  const { baseCurrency, quoteCurrency } = useMarket();

  const currentOrderbookData = useRef(null);
  const lastOrderbookData = useRef(null);

  const [orderbookData, setOrderbookData] = useState(null);

  useInterval(() => {
    if (
      !currentOrderbookData.current ||
      JSON.stringify(currentOrderbookData.current) !==
        JSON.stringify(lastOrderbookData.current)
    ) {
      let bids = orderbook?.bids || [];
      let asks = orderbook?.asks || [];

      let sum = (total, [, size], index) =>
        index < depth ? total + size : total;
      let totalSize = bids.reduce(sum, 0) + asks.reduce(sum, 0);

      let bidsToDisplay = getCumulativeOrderbookSide(bids, totalSize, false);
      let asksToDisplay = getCumulativeOrderbookSide(asks, totalSize, true);

      currentOrderbookData.current = {
        bids: orderbook?.bids,
        asks: orderbook?.asks,
      };

      setOrderbookData({ bids: bidsToDisplay, asks: asksToDisplay });
    }
  }, 250);

  useEffect(() => {
    lastOrderbookData.current = {
      bids: orderbook?.bids,
      asks: orderbook?.asks,
    };
  }, [orderbook]);

  function getCumulativeOrderbookSide(orders, totalSize, backwards = false) {
    let cumulative = orders
      .slice(0, depth)
      .reduce((cumulative, [price, size], i) => {
        const cumulativeSize = (cumulative[i - 1]?.cumulativeSize || 0) + size;
        cumulative.push({
          price,
          size,
          cumulativeSize,
          sizePercent: Math.round((cumulativeSize / (totalSize || 1)) * 100),
        });
        return cumulative;
      }, []);
    if (backwards) {
      cumulative = cumulative.reverse();
    }
    return cumulative;
  }

  return (
    <FloatingElementBlock
      className="order_book new-background"
      style={
        smallScreen
          ? {
              flex: 1,
              // marginTop: "2em",

              // borderStyle: "solid",
              // borderWidth: "2px",
              // borderColor: "rgba(51, 66, 87, 0.6)",
              // borderRadius: "5px",
              // boxShadow: "rgb(15 23 42 / 30%) 0px 4px 16px 2px",
              width: "98%",
              marginLeft: "0.2em",
            }
          : {
              overflow: "hidden",
              boxSizing: "border-box",

              // borderRadius: "5px",
              // borderStyle: "solid",
              // borderWidth: "2px",
              // borderColor: "rgba(51, 66, 87, 0.6)",

              // boxShadow: "rgb(15 23 42 / 30%) 0px 4px 16px 2px",
              width: "100%",
              height: "645px",
              padding: "0 !important",
              minWidth: "360px",
            }
      }
    >
      <SizeTitle
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          border: "1px solid rgb(19, 34, 53)",
          backgroundColor: "rgba(19, 34, 53, 0.5)",
          height: "30px",
        }}
        className="remove-padding"
      >
        <Col
          style={{
            fontFamily: "Poppins",
            fontWeight: 400,
            fontSize: "10px",

            padding: "5px",
            letterSpacing: "1px",
            color: "rgb(226, 232, 240)",
            borderRight: "1px solid rgb(19, 34, 53)",
            textAlign: "center",
            width: "30%",

            alignItems: "center",
          }}
        >
          Price [{quoteCurrency}]
        </Col>
        <Col
          style={{
            fontFamily: "Poppins",
            fontWeight: 400,
            fontSize: "10px",

            padding: "5px",
            letterSpacing: "1px",
            color: "rgb(226, 232, 240)",
            borderRight: "1px solid rgb(19, 34, 53)",
            textAlign: "center",
            width: "30%",

            alignItems: "center",
          }}
        >
          Amount [{baseCurrency}]
        </Col>
        <Col
          style={{
            fontFamily: "Poppins",
            fontWeight: 400,
            fontSize: "10px",

            padding: "5px",
            letterSpacing: "1px",
            color: "rgb(226, 232, 240)",
            // borderRight: "1px solid rgb(19, 34, 53)",
            textAlign: "center",
            width: "30%",

            alignItems: "center",
          }}
        >
          Total [{quoteCurrency}]
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
    const element = useRef();

    const { market } = useMarket();

    useEffect(() => {
      // eslint-disable-next-line
      !element.current?.classList.contains("flash") &&
        element.current?.classList.add("flash");
      const id = setTimeout(
        () =>
          element.current?.classList.contains("flash") &&
          element.current?.classList.remove("flash"),
        250
      );
      return () => clearTimeout(id);
    }, [price, size]);
    //price, size
    let formattedSize =
      market?.minOrderSize && !isNaN(size)
        ? Number(size).toFixed(getDecimalCount(market.minOrderSize) + 1)
        : size;

    let formattedPrice =
      market?.tickSize && !isNaN(price)
        ? Number(price).toFixed(getDecimalCount(market.tickSize) + 1)
        : price;

    return (
      <Row
        ref={element}
        style={{
          marginBottom: 1,
          paddingLeft: "0.2em",
          paddingRight: "0.2em",
          height: "30px",
          borderBottom: "1px solid rgb(19, 34, 53) !important",
          position: "relative",
        }}
        onClick={onSizeClick}
      >
        {" "}
        {side === "buy" ? (
          <BuyLine
            style={{
              position: "absolute",
              padding: 0,
            }}
            data-width={sizePercent + "%"}
          />
        ) : (
          <SellLine
            style={{
              position: "absolute",
              padding: 0,
            }}
            data-width={sizePercent + "%"}
          />
        )}
        {/* <Line
          style={{
            position: "absolute",
            padding: 0,
          }}
          data-width={sizePercent + "%"}
          data-bgcolor={
            side === "buy"
              ? "rgba(50, 205, 153, 0.5)"
              : "rgba(221, 80, 151, 0.5)"
          }
        /> */}
        <Col
          span={8}
          style={{
            textAlign: "left",
            alignItems: "flex-start",
          }}
        >
          <Price
            onClick={onPriceClick}
            style={{
              color: "#FFF",
              left: 20,
              fontFamily: "Inter",
              fontStyle: "normal",
              fontWeight: 500,
              fontSize: "12px",
              lineHeight: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {formattedPrice}
          </Price>
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
            color: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {formattedSize}
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
            color: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {(Number(formattedSize) * Number(formattedPrice)).toFixed(2)}
        </Col>
      </Row>
    );
  },
  (prevProps, nextProps) =>
    isEqual(prevProps, nextProps, ["price", "size", "sizePercent"])
);

const MarkPriceComponent = React.memo(
  ({ markPrice, baseCurrency }) => {
    const { market } = useMarket();
    const previousMarkPrice = usePrevious(markPrice);

    let markPriceColor =
      markPrice > previousMarkPrice
        ? "#32CD99"
        : markPrice < previousMarkPrice
        ? "#F23B69"
        : "#000";

    let formattedMarkPrice =
      markPrice &&
      market?.tickSize &&
      markPrice.toFixed(getDecimalCount(market.tickSize));

    return (
      <MarkPriceTitle justify="center">
        <Col
          style={{
            color: markPriceColor,
            fontSize: "24px",
            fontFamily: "Poppins",
            fontWeight: 400,
            textAlign: "center",
          }}
        >
          {markPrice > previousMarkPrice && (
            <ArrowUpOutlined style={{ marginRight: 5 }} />
          )}
          {markPrice < previousMarkPrice && (
            <ArrowDownOutlined style={{ marginRight: 5 }} />
          )}
          {formattedMarkPrice || "----"} {baseCurrency}
        </Col>
      </MarkPriceTitle>
    );
  },
  (prevProps, nextProps) => isEqual(prevProps, nextProps, ["markPrice"])
);
