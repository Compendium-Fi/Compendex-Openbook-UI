import { Checkbox } from "@mui/material";
import { Button, Input, Slider } from "antd";
import tuple from "immutable-tuple";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { useSendConnection } from "../utils/connection";
import { refreshCache } from "../utils/fetch-loop";
import {
  useFeeDiscountKeys,
  useLocallyStoredFeeDiscountKey,
  useMarket,
  useMarkPrice,
  useSelectedBaseCurrencyAccount,
  useSelectedBaseCurrencyBalances,
  useSelectedOpenOrdersAccount,
  useSelectedQuoteCurrencyAccount,
  useSelectedQuoteCurrencyBalances
} from "../utils/markets";
import { notify } from "../utils/notifications";
import { getUnixTs, placeOrder } from "../utils/send";
import {
  floorToDecimal,
  getDecimalCount,
  roundToDecimal
} from "../utils/utils";
//import { useWallet } from "../utils/wallet";
import FloatingElement from "./layout/FloatingElement";
import StandaloneBalancesDisplay from "./StandaloneBalancesDisplay";
import { BaseSignerWalletAdapter } from "@solana/wallet-adapter-base";
//import "./tradeform.css";
import { useWallet } from "@solana/wallet-adapter-react";

const SellButton = styled(Button)`
  margin: 20px 0px 0px 0px;
  background: rgb(221, 80, 151) !important;
  color: #ffff !important;
  border-radius: 5px;
  min-height: 44px;
`;

const BuyButton = styled(Button)`
  margin: 20px 0px 0px 0px;
  background: rgb(50, 205, 153) !important;
  color: #ffff !important;
  border-radius: 5px;
  min-height: 44px;
`;

export default function TradeForm({
  style,
  setChangeOrderRef,
  small
}: {
  style?: any;
  small: boolean;
  setChangeOrderRef?: (
    ref: ({ size, price }: { size?: number; price?: number }) => void
  ) => void;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [display, setDisplay] = useState("buy");
  const { baseCurrency, quoteCurrency, market } = useMarket();
  const baseCurrencyBalances = useSelectedBaseCurrencyBalances();
  const quoteCurrencyBalances = useSelectedQuoteCurrencyBalances();
  const baseCurrencyAccount = useSelectedBaseCurrencyAccount();
  const quoteCurrencyAccount = useSelectedQuoteCurrencyAccount();
  const openOrdersAccount = useSelectedOpenOrdersAccount(true);
  const { connected, publicKey, wallet } = useWallet();
  const sendConnection = useSendConnection();
  const markPrice = useMarkPrice();
  useFeeDiscountKeys();
  const { storedFeeDiscountKey: feeDiscountKey } =
    useLocallyStoredFeeDiscountKey();

  const [postOnly, setPostOnly] = useState(false);
  const [ioc, setIoc] = useState(false);
  const [baseSize, setBaseSize] = useState<number | undefined>(undefined);
  const [quoteSize, setQuoteSize] = useState<number | undefined>(undefined);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [sizeFraction, setSizeFraction] = useState(0);

  const availableQuote =
    openOrdersAccount && market
      ? market.quoteSplSizeToNumber(openOrdersAccount.quoteTokenFree)
      : 0;

  let quoteBalance = (quoteCurrencyBalances || 0) + (availableQuote || 0);
  let baseBalance = baseCurrencyBalances || 0;
  let sizeDecimalCount =
    market?.minOrderSize && getDecimalCount(market.minOrderSize);
  let priceDecimalCount = market?.tickSize && getDecimalCount(market.tickSize);

  useEffect(() => {
    setChangeOrderRef && setChangeOrderRef(doChangeOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setChangeOrderRef]);

  useEffect(() => {
    baseSize && price && onSliderChange(sizeFraction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side]);

  useEffect(() => {
    updateSizeFraction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, baseSize]);

  useEffect(() => {
    const warmUpCache = async () => {
      try {
        if (!publicKey || !market) {
          console.log(`Skipping refreshing accounts`);
          return;
        }
        const startTime = getUnixTs();
        console.log(`Refreshing accounts for ${market.address}`);
        await market?.findOpenOrdersAccountsForOwner(sendConnection, publicKey);
        await market?.findBestFeeDiscountKey(sendConnection, publicKey);
        const endTime = getUnixTs();
        console.log(
          `Finished refreshing accounts for ${market.address} after ${endTime - startTime
          }`
        );
      } catch (e) {
        console.log(`Encountered error when refreshing trading accounts: ${e}`);
      }
    };
    warmUpCache();
    const id = setInterval(warmUpCache, 30_000);
    return () => clearInterval(id);
  }, [market, sendConnection, publicKey]);

  const onSetBaseSize = (baseSize: number | undefined) => {
    setBaseSize(baseSize);
    if (!baseSize) {
      setQuoteSize(undefined);
      return;
    }
    let usePrice = price || markPrice;
    if (!usePrice) {
      setQuoteSize(undefined);
      return;
    }
    const rawQuoteSize = baseSize * usePrice;
    const quoteSize =
      baseSize && roundToDecimal(rawQuoteSize, sizeDecimalCount);
    setQuoteSize(quoteSize);
  };

  const onSetQuoteSize = (quoteSize: number | undefined) => {
    setQuoteSize(quoteSize);
    if (!quoteSize) {
      setBaseSize(undefined);
      return;
    }
    let usePrice = price || markPrice;
    if (!usePrice) {
      setBaseSize(undefined);
      return;
    }
    const rawBaseSize = quoteSize / usePrice;
    const baseSize = quoteSize && roundToDecimal(rawBaseSize, sizeDecimalCount);
    setBaseSize(baseSize);
  };

  const doChangeOrder = ({
    size,
    price
  }: {
    size?: number;
    price?: number;
  }) => {
    const formattedSize = size && roundToDecimal(size, sizeDecimalCount);
    const formattedPrice = price && roundToDecimal(price, priceDecimalCount);
    formattedSize && onSetBaseSize(formattedSize);
    formattedPrice && setPrice(formattedPrice);
  };

  const updateSizeFraction = () => {
    const rawMaxSize =
      side === "buy" ? quoteBalance / (price || markPrice || 1) : baseBalance;
    const maxSize = floorToDecimal(rawMaxSize, sizeDecimalCount);
    const sizeFraction = Math.min(((baseSize || 0) / maxSize) * 100, 100);
    setSizeFraction(sizeFraction);
  };

  const onSliderChange = (value) => {
    if (!price && markPrice) {
      let formattedMarkPrice: number | string = priceDecimalCount
        ? markPrice.toFixed(priceDecimalCount)
        : markPrice;
      setPrice(
        typeof formattedMarkPrice === "number"
          ? formattedMarkPrice
          : parseFloat(formattedMarkPrice)
      );
    }

    let newSize;
    if (side === "buy") {
      if (price || markPrice) {
        newSize = ((quoteBalance / (price || markPrice || 1)) * value) / 100;
      }
    } else {
      newSize = (baseBalance * value) / 100;
    }

    // round down to minOrderSize increment
    let formatted = floorToDecimal(newSize, sizeDecimalCount);

    onSetBaseSize(formatted);
  };

  const postOnChange = (checked) => {
    if (checked) {
      setIoc(false);
    }
    setPostOnly(checked);
  };
  const iocOnChange = (checked) => {
    if (checked) {
      setPostOnly(false);
    }
    setIoc(checked);
  };

  async function onSubmit() {
    if (!price) {
      console.warn("Missing price");
      notify({
        message: "Missing price",
        type: "error"
      });
      return;
    } else if (!baseSize) {
      console.warn("Missing size");
      notify({
        message: "Missing size",
        type: "error"
      });
      return;
    }

    setSubmitting(true);
    try {
      if (!wallet) {
        return null;
      }

      await placeOrder({
        side,
        price,
        size: baseSize,
        orderType: ioc ? "ioc" : postOnly ? "postOnly" : "limit",
        market,
        connection: sendConnection,
        wallet: wallet.adapter as BaseSignerWalletAdapter,
        baseCurrencyAccount: baseCurrencyAccount?.pubkey,
        quoteCurrencyAccount: quoteCurrencyAccount?.pubkey,
        feeDiscountPubkey: feeDiscountKey
      });
      refreshCache(tuple("getTokenAccounts", wallet, connected));
      setPrice(undefined);
      onSetBaseSize(undefined);
    } catch (e: any) {
      console.warn(e);
      notify({
        message: "Error placing order",
        description: e.message,
        type: "error"
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FloatingElement
      style={{
        display: "flex",
        flexDirection: "column",
        ...style,
        // borderStyle: "solid",
        // borderWidth: "2px",
        // borderColor: "rgba(51, 66, 87, 0.6)",
        backgroundColor: "transparent",

        // boxShadow: "rgb(15 23 42 / 30%) 0px 4px 16px 2px",
        // borderRadius: "5px",

        height: "520px",
        marginBottom: small ? "0px" : "0px",
        marginTop: small ? "0px" : "0px"
        // maxWidth: "360px",
        // marginBottom: "30px"
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            marginTop: "15px",
            marginBottom: "15px",
            gap: "10px"
          }}
        >
          <Button
            onClick={() => {
              setSide("buy");
            }}
            style={{
              // borderRadius: "12px",
              // width: "140px",
              // height: "24px",
              // borderRadius: "5px",
              border: "1px solid rgba(50, 205, 153, 1) !important"
            }}
            className={`active-sell ${side === "buy" ? "active-sell-buy" : ""}`}
          >
            <span
              style={{
                textAlign: "center",
                fontWeight: "bold"
              }}
            >
              Buy {baseCurrency}
            </span>
          </Button>
          <Button
            onClick={() => {
              setSide("sell");
            }}
            style={{
              width: "140px",
              height: "24px"
            }}
            className={` active-sell  ${side === "sell" ? "active-sell-sell" : ""
              } `}
          >
            {" "}
            <span
              style={{
                textAlign: "center",
                fontWeight: "bold",
                color: "rgba(221, 80, 151, 1)"
              }}
            >
              Sell {baseCurrency}
            </span>
          </Button>
        </div>
        {/* */}
        {display !== "balance" ? (
          <div id="buy/sell">
            <div style={{ flex: 1 }}>
              <div
                style={{
                  textAlign: "left",
                  backgroundColor: "rgba(19, 34, 53, 0.5)",
                  borderStyle: "solid",
                  borderWidth: "1px",
                  borderColor: "rgba(19, 34, 53, 1)",
                  borderRadius: "5px",
                  height: "56px",
                  marginBottom: 15
                }}
              >
                <span
                  style={{
                    fontFamily: "Poppins !important",
                    fontStyle: "normal",
                    letterSpacing: "1px",
                    marginLeft: 10,
                    whiteSpace: "pre-wrap",
                    fontSize: "12px",
                    color: "rgba(119,145,224,1)",
                    textAlign: "right",
                    lineHeight: "1"
                  }}
                >
                  Price
                </span>
                <Input
                  suffix={
                    <span
                      style={{
                        fontFamily: "Poppins !important",
                        fontStyle: "normal",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        marginLeft: 10,
                        whiteSpace: "pre-wrap",
                        fontSize: "14px",
                        textAlign: "right",
                        lineHeight: "1.25",
                        color: "rgba(181, 181, 181, 1)"
                      }}
                    >
                      {quoteCurrency}
                    </span>
                  }
                  value={price}
                  type="number"
                  step={market?.tickSize || 1}
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                />
              </div>
              <div
                style={{
                  textAlign: "left",
                  backgroundColor: "rgba(19, 34, 53, 0.5)",
                  borderStyle: "solid",
                  borderWidth: "1px",
                  borderColor: "rgba(19, 34, 53, 1)",
                  borderRadius: "5px",
                  height: "56px",
                  marginBottom: 15
                }}
              >
                <span
                  style={{
                    fontFamily: "Poppins !important",
                    fontStyle: "normal",
                    letterSpacing: "1px",

                    marginLeft: 10,
                    whiteSpace: "pre-wrap",
                    fontSize: "12px",
                    color: "rgba(119,145,224,1)",
                    textAlign: "right",
                    lineHeight: "1"
                  }}
                >
                  Amount
                </span>
                <Input
                  type="number"
                  suffix={
                    <span
                      style={{
                        fontFamily: "Poppins !important",
                        fontStyle: "normal",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        marginLeft: 10,
                        whiteSpace: "pre-wrap",
                        fontSize: "14px",

                        textAlign: "right",
                        lineHeight: "1.25"
                      }}
                    >
                      {baseCurrency}
                    </span>
                  }
                  value={baseSize}
                  step={market?.minOrderSize || 1}
                  onChange={(e) => onSetBaseSize(parseFloat(e.target.value))}
                />
              </div>
              <div
                style={{
                  textAlign: "left",
                  backgroundColor: "rgba(19, 34, 53, 0.5)",
                  borderStyle: "solid",
                  borderWidth: "1px",
                  borderColor: "rgba(19, 34, 53, 1)",
                  borderRadius: "5px",
                  height: "56px",
                  marginBottom: 15
                }}
              >
                <span
                  style={{
                    fontFamily: "Poppins !important",
                    fontStyle: "normal",
                    letterSpacing: "1px",
                    marginLeft: 10,
                    whiteSpace: "pre-wrap",
                    fontSize: "12px",
                    color: "rgba(119,145,224,1)",
                    textAlign: "right",
                    lineHeight: "1"
                  }}
                >
                  Total
                </span>
                <Input
                  style={{ padding: "-2em" }}
                  type="number"
                  suffix={
                    <span
                      style={{
                        fontFamily: "Poppins !important",
                        fontStyle: "normal",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        marginLeft: 10,
                        whiteSpace: "pre-wrap",
                        fontSize: "14px",

                        textAlign: "right",
                        lineHeight: "1.25"
                      }}
                    >
                      {quoteCurrency}
                    </span>
                  }
                  value={quoteSize}
                  step={market?.minOrderSize || 1}
                  onChange={(e) => onSetQuoteSize(parseFloat(e.target.value))}
                />
              </div>
              <span
                style={{
                  color: "rgb(119, 145, 224)",
                  fontSize: "12px",
                  fontWeight: 400
                }}
              >
                Set Trade Size (Available Balance)
              </span>
              <div style={{ marginTop: "-30px" }}>
                <Slider
                  value={sizeFraction}
                  tipFormatter={(value) => `${value}%`}
                  handleStyle={{
                    cursor: "pointer",
                    outline: "currentcolor none medium",
                    border: "solid 1px rgba(219, 219, 219, 0.8) !important",
                    top: "-2px",
                    height: "23px",
                    width: " 19px",
                    background: "rgb(230, 230, 230) none repeat scroll 0% 0%"
                  }}
                  onChange={onSliderChange}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  flexDirection: "column",
                  backgroundColor: "rgba(19, 34, 53, 0.5)",
                  borderColor: "rgb(19, 34, 53)",
                  borderStyle: "solid",
                  borderWidth: "1px",
                  borderRadius: "5px",
                  padding: "5px",
                  marginTop: "25px"
                }}
              >
                <span
                  style={{
                    color: "rgb(119, 145, 224)",
                    fontWeight: 400,
                    fontSize: "12px"
                  }}
                >
                  Advanced Trade Settings
                </span>
                <div>
                  <Checkbox
                    checked={postOnly}
                    onChange={postOnChange}
                    inputProps={{ style: { backgroundColor: "#FFF" } }}
                  // style={{ marginRight: 40 }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "rgb(226, 232, 240)"
                    }}
                  >
                    Post-Only Order (POST)
                  </span>
                </div>
                <div>
                  <Checkbox
                    checked={ioc}
                    onChange={iocOnChange}
                    inputProps={{ style: { backgroundColor: "#FFF" } }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "rgb(226, 232, 240)"
                    }}
                  >
                    Immediate-Or-Cancel (IOC)
                  </span>
                </div>
              </div>
            </div>
            {side === "buy" ? (
              <BuyButton
                className={`${!price || !baseSize ? "disabled-trade-btn" : "buy-trade-btn"
                  }`}
                disabled={!price || !baseSize}
                onClick={onSubmit}
                block
                type="primary"
                size="large"
                loading={submitting}
              >
                Buy {baseCurrency}
              </BuyButton>
            ) : (
              <SellButton
                disabled={!price || !baseSize}
                onClick={onSubmit}
                block
                type="primary"
                size="large"
                loading={submitting}
                className={`${!price || !baseSize ? "disabled-trade-btn" : "sell-trade-btn"
                  }`}
              >
                Sell {baseCurrency}
              </SellButton>
            )}
          </div>
        ) : (
          <StandaloneBalancesDisplay smallScreen={undefined} />
        )}
      </div>
    </FloatingElement>
  );
}
