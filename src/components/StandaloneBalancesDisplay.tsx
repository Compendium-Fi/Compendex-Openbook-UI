import { Button, Col, Row } from "antd";
import React, { useContext, useState } from "react";
import styled from "styled-components";
// import solanaDefaultIcon from "../../assets/img/icons/SOL.png";
// import solscan from "../../assets/img/solscan.png";

import { useSendConnection } from "../utils/connection";
import {
  useBalances,
  useMarket,
  useSelectedBaseCurrencyAccount,
  useSelectedOpenOrdersAccount,
  useSelectedQuoteCurrencyAccount,
  useTokenAccounts
} from "../utils/markets";
import { notify } from "../utils/notifications";
import { AUTO_SETTLE_DISABLED_OVERRIDE } from "../utils/preferences";
import { useReferrer } from "../utils/referrer";
import { settleFunds } from "../utils/send";
import { Balances } from "../utils/types";
import { useInterval } from "../utils/useInterval";
import { useLocalStorageState } from "../utils/utils";
//import { useWallet } from "../utils/wallet";
//import "./balanceDisplay.css";
import DepositDialog from "./DepositDialog";
import FloatingElement from "./layout/FloatingElement";
import StandaloneTokenAccountsSelect from "./StandaloneTokenAccountSelect";
import { useWallet } from "@solana/wallet-adapter-react";
import { BaseSignerWalletAdapter } from "@solana/wallet-adapter-base";
import { useTokenList } from "../context/tokenList";
const RowBox = styled(Row)`
  padding-bottom: 20px;
`;

const Tip = styled.p`
  font-size: 12px;
  padding-top: 6px;
`;

const ActionButton = styled(Button)`
  border-radius: 5px !important;
`;

export default function StandaloneBalancesDisplay({ smallScreen }: { smallScreen: boolean }) {
  const { baseCurrency, quoteCurrency, market } = useMarket();
  const balances = useBalances();
  const openOrdersAccount = useSelectedOpenOrdersAccount(true);
  const connection = useSendConnection();
  const { wallet, connected } = useWallet();
  const [baseOrQuote, setBaseOrQuote] = useState("");
  const baseCurrencyAccount = useSelectedBaseCurrencyAccount();
  const quoteCurrencyAccount = useSelectedQuoteCurrencyAccount();
  const [tokenAccounts] = useTokenAccounts();
  const baseCurrencyBalances =
    balances && balances.find((b) => b.coin === baseCurrency);
  const quoteCurrencyBalances =
    balances && balances.find((b) => b.coin === quoteCurrency);
  const [autoSettleEnabled] = useLocalStorageState("autoSettleEnabled", true);
  const [lastSettledAt, setLastSettledAt] = useState<number>(0);
  const { usdcRef, usdtRef } = useReferrer();
  const { splTokenList } = useTokenList();

  const displayIcon = (mint: string | undefined) => {
    if (splTokenList.length !== 0) {
      let token: any = splTokenList.find((elm: any) => elm.address === mint);
      if (token) {
        return (
          <img
            src={token.logoURI}
            style={{ width: 30, height: 30, objectFit: "contain" }}
            alt=""
          />
        );
      } else {
        return (
          <img
            src={"/assets/img/solscan.png"}
            style={{ width: 30, height: 30, objectFit: "contain" }}
            alt=""
          />
        );
      }
    } else {
      return (
        <img
          src={"/assets/img/solscan.png"}
          style={{ width: 20, height: 20, objectFit: "contain" }}
          alt=""
        />
      );
    }
  };
  const displayName = (mint: string | any) => {
    if (splTokenList.length !== 0) {
      let token: any = splTokenList.find((elm: any) => elm.address === mint);
      if (token) {
        return (
          <div>
            <span>{token.name}</span>
            <br />
            <span>{token.symbol}</span>
          </div>
        );
      } else {
        return (
          <div>
            <span>Wrapped Solana</span>
            <span>SOL</span>
          </div>
        );
      }
    } else {
      return (
        <div>
          <span>Wrapped Solana</span>
          <br />
          <span>SOL</span>
        </div>
      );
    }
  };
  async function onSettleFunds() {
    if (!wallet) {
      notify({
        message: "Make sure to connect a supported walllet.",
        description:
          "We noticed that you currently do not have a wallet connected to our platform. Please connect a supported wallet to continue.",
        type: "error"
      });
      return;
    }

    if (!market) {
      notify({
        message: "There was an error settling your funds.",
        description:
          "The selected market may currently be undefined. Please double check your inputs and selections before trying again.",
        type: "error"
      });
      return;
    }
    if (!openOrdersAccount) {
      notify({
        message: "There was an error settling your funds.",
        description:
          "The open orders account may currently be undefined. Please double check your inputs and selections before trying again.",
        type: "error"
      });
      return;
    }
    if (!baseCurrencyAccount) {
      notify({
        message: "There was an error settling your funds.",
        description:
          "The open orders account may currently be undefined. Please double check your inputs and selections before trying again.",
        type: "error"
      });
      return;
    }
    if (!quoteCurrencyAccount) {
      notify({
        message: "There was an error settling your funds.",
        description:
          "The open orders account may currently be undefined. Please double check your inputs and selections before trying again.",
        type: "error"
      });
      return;
    }

    try {
      await settleFunds({
        market,
        openOrders: openOrdersAccount,
        connection,
        wallet: wallet.adapter as BaseSignerWalletAdapter,
        baseCurrencyAccount,
        quoteCurrencyAccount,
        usdcRef,
        usdtRef
      });
    } catch (e: any) {
      notify({
        message: "There was an error settling your funds.",
        description: e.message,
        type: "error"
      });
    }
  }

  useInterval(() => {
    const autoSettle = async () => {
      if (
        AUTO_SETTLE_DISABLED_OVERRIDE ||
        !wallet ||
        !market ||
        !openOrdersAccount ||
        !baseCurrencyAccount ||
        !quoteCurrencyAccount ||
        !autoSettleEnabled
      ) {
        return;
      }
      if (
        !baseCurrencyBalances?.unsettled &&
        !quoteCurrencyBalances?.unsettled
      ) {
        return;
      }
      if (Date.now() - lastSettledAt < 15000) {
        return;
      }
      try {
        console.log("Settling funds...");
        setLastSettledAt(Date.now());
        await settleFunds({
          market,
          openOrders: openOrdersAccount,
          connection,
          wallet: wallet.adapter as BaseSignerWalletAdapter,
          baseCurrencyAccount,
          quoteCurrencyAccount,
          usdcRef,
          usdtRef
        });
      } catch (e: any) {
        console.log("Error auto settling funds: " + e.message);
        return;
      }
      console.log("Finished settling funds.");
    };

    connected &&
      (wallet?.adapter as any).autoApprove &&
      autoSettleEnabled &&
      autoSettle();
  }, 1000);

  const formattedBalances: [
    string | undefined,
    Balances | undefined,
    string,
    string | undefined
  ][] = [
      [
        baseCurrency,
        baseCurrencyBalances,
        "base",
        market?.baseMintAddress.toBase58()
      ],
      [
        quoteCurrency,
        quoteCurrencyBalances,
        "quote",
        market?.quoteMintAddress.toBase58()
      ]
    ];

  return (
    //@ts-ignore
    <FloatingElement
      className="new-background"
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "transparent",
        borderRadius: "5px",
        height: smallScreen ? "570px" : "510px",
        paddingTop: "0px"

      }}
    >
      {formattedBalances.map(
        ([currency, balances, baseOrQuote, mint], index) => (
          <React.Fragment key={index}>

            <div className="token-card-dex">
              <div className="token-info">
                <span>{displayIcon(mint)}</span>
                <span style={{ marginRight: "0.7em" }}>
                  {displayName(mint)}
                </span>
              </div>
              <a
                href={`https://solscan.io/token/${mint}`}
                target="_blank"
                rel="noreferrer"
              >
                {/* <img
                  src={solscan}
                  style={{
                    width: 30,
                    height: 30,
                    objectFit: "contain",
                    borderRadius: 30
                  }}
                  alt=""
                /> */}
              </a>
            </div>

            {connected ? (
              <div className="token-card-mint">
                <StandaloneTokenAccountsSelect
                  accounts={tokenAccounts?.filter(
                    (account) => account.effectiveMint.toBase58() === mint
                  )}
                  mint={mint}
                  label
                />
              </div>
            ) : (
              <div className="token-card-mint">{mint}</div>
            )}
            <RowBox
              align="middle"
              justify="space-between"
              style={{ paddingBottom: 12, marginTop: "10px" }}
            >
              <Col>
                <span className="balance-label">Wallet balance:</span>
              </Col>
              <Col>
                {connected && <span className="balance-label">
                  {balances && balances.wallet}
                </span>}
                {!connected && (
                  <span className="balance-label">Please Connect Wallet</span>
                )}
              </Col>
            </RowBox>
            <RowBox
              align="middle"
              justify="space-between"
              style={{ paddingBottom: 12 }}
            >
              <Col>
                <span className="balance-label">Unsettled balance:</span>
              </Col>
              <Col>
                {
                  connected && <span className="balance-label">
                    {balances && balances.unsettled ? balances.unsettled : '0'}
                  </span>
                }
                {
                  !connected &&
                  <span className="balance-label">Please Connect Wallet</span>

                }
              </Col>
            </RowBox>
            <RowBox align="middle" justify="space-around">

              <Col flex={"auto"}>
                <ActionButton
                  block
                  size="large"
                  className="settle-btn"
                  onClick={onSettleFunds}
                >
                  Settle
                </ActionButton>
              </Col>
            </RowBox>

          </React.Fragment>
        )
      )}
      <DepositDialog
        baseOrQuote={baseOrQuote}
        onClose={() => setBaseOrQuote("")}
      />
    </FloatingElement>
  );
}
