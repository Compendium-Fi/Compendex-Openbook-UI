import { Col, Row } from "antd";
import React from "react";
import styled from "styled-components";
import { useMarket, useBonfidaTrades } from "../utils/markets";
import { getDecimalCount } from "../utils/utils";
import FloatingElement from "./layout/FloatingElement";
import { BonfidaTrade } from "../utils/types";

const Title = styled.div`
  color: rgba(255, 255, 255, 1);
`;
const SizeTitle = styled(Row)`
  padding: 0px 0 10px;
  color: #acacad;
`;

export default function PublicTrades({ smallScreen }) {
  const { baseCurrency, quoteCurrency, market } = useMarket();
  const [trades, loaded] = useBonfidaTrades();

  return (
    <FloatingElement
      style={
        smallScreen
          ? {
              flex: 1,
              height: 570,
            }
          : {
              display: "flex",
              flexDirection: "column",

              height: 600,
              margin: 0,
              padding: 0,
            }
      }
    >
      <SizeTitle
        style={{
          border: "1px solid rgb(19, 34, 53)",
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          backgroundColor: "rgba(19, 34, 53, 0.5)",
          height: "30px",
          padding: "5px",
          margin: "0px",
        }}
      >
        <Col
          style={{
            fontFamily: "Poppins",
            fontWeight: 400,
            fontSize: "10px",
            letterSpacing: "1px",
            color: "rgb(226, 232, 240)",
            borderRight: "1px solid rgb(19, 34, 53)",
            textAlign: "center",
            width: "20%",
            alignItems: "center",
          }}
        >
          Time
        </Col>
        <Col
          style={{
            fontFamily: "Poppins",
            fontWeight: 400,
            fontSize: "10px",

            letterSpacing: "1px",
            color: "rgb(226, 232, 240)",
            borderRight: "1px solid rgb(19, 34, 53)",
            textAlign: "center",
            width: "20%",
            alignItems: "center",
          }}
        >
          Price ({quoteCurrency}){" "}
        </Col>
        <Col
          style={{
            fontFamily: "Poppins",
            fontWeight: 400,
            fontSize: "10px",

            letterSpacing: "1px",
            color: "rgb(226, 232, 240)",
            borderRight: "1px solid rgb(19, 34, 53)",
            textAlign: "center",
            width: "20%",
            alignItems: "center",
          }}
        >
          Size ({baseCurrency})
        </Col>
        <Col
          style={{
            fontFamily: "Poppins",
            fontWeight: 400,
            fontSize: "10px",

            letterSpacing: "1px",
            color: "rgb(226, 232, 240)",
            borderRight: "1px solid rgb(19, 34, 53)",
            textAlign: "center",
            width: "20%",
            alignItems: "center",
          }}
        >
          Taker
        </Col>
        <Col
          style={{
            fontFamily: "Poppins",
            fontWeight: 400,
            fontSize: "10px",

            letterSpacing: "1px",
            color: "rgb(226, 232, 240)",
            textAlign: "center",
            width: "20%",
            alignItems: "center",
          }}
        >
          Maker
        </Col>
      </SizeTitle>
      {!!trades && loaded && (
        <div
          style={{
            overflowY: "scroll",
            maxHeight: smallScreen
              ? "calc(100% - 75px)"
              : "480px",
          }}
        >
          {trades.map((trade: BonfidaTrade, i: number) => (
            <Row
              key={i}
              style={{
                marginBottom: 5,
                borderBottom: "1px solid rgba(51, 66, 87, 0.6)",
                flexWrap: "nowrap",
                justifyContent: "flex-start",
                display: "flex",
                width: "100%",
                textAlign: "center",
                alignItems: "center",
                height: "30px",
              }}
            >
              <Col
                style={{
                  display: "flex",
                  justifyContent: "center",
                  textAlign: "center",
                  width: "20%",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "Poppins",
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "rgba(181, 181, 181, 1)",
                    textAlign: "center",
                    lineHeight: 1,
                  }}
                >
                  {trade.time && new Date(trade.time).toLocaleTimeString()}
                </span>
              </Col>
              <Col
                style={{
                  display: "flex",
                  justifyContent: "center",
                  textAlign: "center",
                  width: "20%",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color:
                      trade.side === "buy"
                        ? "rgba(50, 205, 153, 1)"
                        : "rgba(221, 80, 151, 1)",
                    fontFamily: "Poppins",
                    fontSize: "12px",
                    fontWeight: 400,

                    textAlign: "center",
                    lineHeight: 1,
                  }}
                >
                  {market?.tickSize && !isNaN(trade.price)
                    ? Number(trade.price).toFixed(
                        getDecimalCount(market.tickSize)
                      )
                    : trade.price}
                </span>
              </Col>
              <Col
                style={{
                  display: "flex",
                  justifyContent: "center",
                  textAlign: "center",
                  width: "20%",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "Poppins",
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "rgba(181, 181, 181, 1)",
                    textAlign: "center",
                    lineHeight: 1,
                  }}
                >
                  {market?.minOrderSize && !isNaN(trade.size)
                    ? Number(trade.size).toFixed(
                        getDecimalCount(market.minOrderSize)
                      )
                    : trade.size}
                </span>
              </Col>
              <Col
                style={{
                  display: "flex",
                  justifyContent: "center",
                  textAlign: "center",
                  width: "20%",
                  alignItems: "center",
                }}
              >
                <a
                  href={`https://solscan.io/account/${trade.takerAccount}`}
                  target="_blank"
                  style={{
                    fontFamily: "Poppins",
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "rgba(181, 181, 181, 1)",
                    lineHeight: 1,
                    textDecoration: "underline",
                  }}
                  rel="noreferrer"
                >
                  {`${trade.takerAccount.slice(
                    0,
                    3
                  )}...${trade.takerAccount.slice(-3)}`}
                </a>
              </Col>
              <Col
                style={{
                  display: "flex",
                  justifyContent: "center",
                  textAlign: "center",
                  width: "20%",
                  alignItems: "center",
                }}
              >
                <a
                  href={`https://solscan.io/account/${trade.makerAccount}`}
                  target="_blank"
                  style={{
                    fontFamily: "Poppins",
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "rgba(181, 181, 181, 1)",
                    lineHeight: 1,
                    textDecoration: "underline",
                  }}
                  rel="noreferrer"
                >
                  {`${trade.makerAccount.slice(
                    0,
                    3
                  )}...${trade.makerAccount.slice(-3)}`}
                </a>
              </Col>
            </Row>
          ))}
        </div>
      )}
    </FloatingElement>
  );
}
