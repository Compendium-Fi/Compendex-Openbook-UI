import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Wallet from "@project-serum/sol-wallet-adapter";
import { notify } from "./notifications";
import { useConnectionConfig } from "./connection";
import { useLocalStorageState } from "./utils";
import { WalletContextValues } from "./types";
//import { Button, Modal } from "antd";
import {
  WalletAdapter,
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolletExtensionAdapter,
  MathWalletAdapter,
  SlopeWalletAdapter,
  Coin98WalletAdapter,
  ExodusWalletAdapter,
} from "../wallet-adapters";
import { Modal, Button } from "@mantine/core";
const ASSET_URL =
  "https://cdn.jsdelivr.net/gh/solana-labs/oyster@main/assets/wallets";
export const WALLET_PROVIDERS = [
  {
    name: "sollet.io",
    url: "https://www.sollet.io",
    icon: `${ASSET_URL}/sollet.svg`,
  },
  {
    name: "Sollet Extension",
    url: "https://www.sollet.io/extension",
    icon: `${ASSET_URL}/sollet.svg`,
    adapter: SolletExtensionAdapter as any,
  },
  {
    name: "Ledger",
    url: "https://www.ledger.com",
    icon: `${ASSET_URL}/ledger.svg`,
    adapter: LedgerWalletAdapter,
  },
  {
    name: "Solflare",
    url: "https://solflare.com/access-wallet",
    icon: `${ASSET_URL}/solflare.svg`,
  },

  {
    name: "Phantom",
    url: "https://www.phantom.app",
    icon: `https://www.phantom.app/img/logo.png`,
    adapter: PhantomWalletAdapter,
  },
  {
    name: "MathWallet",
    url: "https://www.mathwallet.org",
    icon: `${ASSET_URL}/mathwallet.svg`,
    adapter: MathWalletAdapter,
  },
  // {
  //   name: "SlopeWallet",
  //   url: "https://slope.finance/",
  //   icon: `https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=1,format=auto/https%3A%2F%2Fdocs.slope.finance%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-MlOlWuD8X-mIrzvVU3W%252Ficon%252FQ8tdcABNleXu7Spqfdqy%252F222.png%3Falt%3Dmedia%26token%3D3f599864-00d3-4b53-8fe3-0b1f93d2bec4`,
  //   adapter: SlopeWalletAdapter,
  // },
  {
    name: "Coin98",
    url: "https://wallet.coin98.com/",
    icon: `https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=1,format=auto/https%3A%2F%2F3402132828-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fcollections%252FQJMp3A6g9RBnZQcfSRJE%252Ficon%252FbceLKfNHv0QkclPIaAxM%252Fcoin98_wallet.jpeg%3Falt%3Dmedia%26token%3D42ce2ec9-f0f3-4449-a215-74346571ca54`,
    adapter: Coin98WalletAdapter,
  },
  {
    name: "Exodus",
    url: "https://www.exodus.com/browser-extension",
    icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIyIiBoZWlnaHQ9IjEyNCIgdmlld0JveD0iMCAwIDEyMiAxMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxtYXNrIGlkPSJtYXNrMF8zMF8xMTAiIHN0eWxlPSJtYXNrLXR5cGU6YWxwaGEiIG1hc2tVbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjAiIHk9IjAiIHdpZHRoPSIxMjIiIGhlaWdodD0iMTI0Ij4KPHBhdGggZD0iTTEyMS43ODcgMzQuODMzMUw2OS4zODc2IDAuNDc2NTYyVjE5LjY4NTVMMTAzLjAwMiA0MS41Mjg4TDk5LjA0NzQgNTQuMDQySDY5LjM4NzZWNjkuOTU4SDk5LjA0NzRMMTAzLjAwMiA4Mi40NzEyTDY5LjM4NzYgMTA0LjMxNFYxMjMuNTIzTDEyMS43ODcgODkuMjc2N0wxMTMuMjE4IDYyLjA1NDlMMTIxLjc4NyAzNC44MzMxWiIgZmlsbD0iIzFEMUQxQiIvPgo8cGF0aCBkPSJNMjMuNzk5MyA2OS45NThINTMuMzQ5M1Y1NC4wNDJIMjMuNjg5NEwxOS44NDQ2IDQxLjUyODhMNTMuMzQ5MyAxOS42ODU1VjAuNDc2NTYyTDAuOTUwMTk1IDM0LjgzMzFMOS41MTg2IDYyLjA1NDlMMC45NTAxOTUgODkuMjc2N0w1My40NTkxIDEyMy41MjNWMTA0LjMxNEwxOS44NDQ2IDgyLjQ3MTJMMjMuNzk5MyA2OS45NThaIiBmaWxsPSIjMUQxRDFCIi8+CjwvbWFzaz4KPGcgbWFzaz0idXJsKCNtYXNrMF8zMF8xMTApIj4KPHBhdGggZD0iTTEyMS43ODcgMzQuODMzMUw2OS4zODc2IDAuNDc2NTYyVjE5LjY4NTVMMTAzLjAwMiA0MS41Mjg4TDk5LjA0NzQgNTQuMDQySDY5LjM4NzZWNjkuOTU4SDk5LjA0NzRMMTAzLjAwMiA4Mi40NzEyTDY5LjM4NzYgMTA0LjMxNFYxMjMuNTIzTDEyMS43ODcgODkuMjc2N0wxMTMuMjE4IDYyLjA1NDlMMTIxLjc4NyAzNC44MzMxWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTIzLjc5OTMgNjkuOTU4SDUzLjM0OTNWNTQuMDQySDIzLjY4OTRMMTkuODQ0NiA0MS41Mjg4TDUzLjM0OTMgMTkuNjg1NVYwLjQ3NjU2MkwwLjk1MDE5NSAzNC44MzMxTDkuNTE4NiA2Mi4wNTQ5TDAuOTUwMTk1IDg5LjI3NjdMNTMuNDU5MSAxMjMuNTIzVjEwNC4zMTRMMTkuODQ0NiA4Mi40NzEyTDIzLjc5OTMgNjkuOTU4WiIgZmlsbD0id2hpdGUiLz4KPHJlY3QgeD0iMS4xMDYzMiIgeT0iMC40NzY1NjIiIHdpZHRoPSIxMzMuNzQ0IiBoZWlnaHQ9IjEzNi4wODUiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8zMF8xMTApIi8+CjxlbGxpcHNlIGN4PSI4LjQzMTc2IiBjeT0iMjcuNDYwMiIgcng9IjExNy42MzkiIHJ5PSIxMjcuNTQ1IiB0cmFuc2Zvcm09InJvdGF0ZSgtMzMuOTMwMyA4LjQzMTc2IDI3LjQ2MDIpIiBmaWxsPSJ1cmwoI3BhaW50MV9yYWRpYWxfMzBfMTEwKSIvPgo8L2c+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMzBfMTEwIiB4MT0iMTA1LjA4NCIgeTE9IjEzMi41OTQiIHgyPSI2OS44NDM5IiB5Mj0iLTEyLjI3NjUiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzBCNDZGOSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNCQkZCRTAiLz4KPC9saW5lYXJHcmFkaWVudD4KPHJhZGlhbEdyYWRpZW50IGlkPSJwYWludDFfcmFkaWFsXzMwXzExMCIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSg4LjQzMTc1IDI3LjQ2MDIpIHJvdGF0ZSg3Mi4yNTU3KSBzY2FsZSg5Ni40OTc5IDkwLjQ1NDMpIj4KPHN0b3Agb2Zmc2V0PSIwLjExOTc5MiIgc3RvcC1jb2xvcj0iIzg5NTJGRiIgc3RvcC1vcGFjaXR5PSIwLjg3Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0RBQkRGRiIgc3RvcC1vcGFjaXR5PSIwIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==",
    adapter: ExodusWalletAdapter,
  },
];

const WalletContext = React.createContext<null | WalletContextValues>(null);

export function WalletProvider({ children }) {
  const { endpoint } = useConnectionConfig();

  const [autoConnect, setAutoConnect] = useState(false);
  const [providerUrl, setProviderUrl] = useLocalStorageState("walletProvider");

  const provider = useMemo(
    () => WALLET_PROVIDERS.find(({ url }) => url === providerUrl),
    [providerUrl]
  );

  let [wallet, setWallet] = useState<WalletAdapter | undefined>(undefined);

  useEffect(() => {
    if (provider) {
      const updateWallet = () => {
        // hack to also update wallet synchronously in case it disconnects
        // eslint-disable-next-line react-hooks/exhaustive-deps
        wallet = new (provider.adapter || Wallet)(
          providerUrl,
          endpoint
        ) as WalletAdapter;
        setWallet(wallet);
      };

      if (document.readyState !== "complete") {
        // wait to ensure that browser extensions are loaded
        const listener = () => {
          updateWallet();
          window.removeEventListener("load", listener);
        };
        window.addEventListener("load", listener);
        return () => window.removeEventListener("load", listener);
      } else {
        updateWallet();
      }
    }
  }, [provider, providerUrl, endpoint]);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (wallet) {
      wallet.on("connect", () => {
        if (wallet?.publicKey) {
          // console.log("connected");
          localStorage.removeItem("feeDiscountKey");
          setConnected(true);
          const walletPublicKey = wallet.publicKey.toBase58();
          const keyToDisplay =
            walletPublicKey.length > 20
              ? `${walletPublicKey.substring(
                  0,
                  7
                )}.....${walletPublicKey.substring(
                  walletPublicKey.length - 7,
                  walletPublicKey.length
                )}`
              : walletPublicKey;

          notify({
            message: "Your Wallet Has Been Connected!",
            description:
              "You can now start trading and utilizing our new tool suite for Solana applications.",
            type: "success",
            txid: walletPublicKey,
            wallet: true,
          });
        }
      });

      wallet.on("disconnect", () => {
        setConnected(false);
        notify({
          message: "Your Wallet Has Been Desconnected!",
          description: "Please come again!",
          type: "success",
          wallet: true,
        });
        localStorage.removeItem("feeDiscountKey");
      });
    }

    return () => {
      setConnected(false);
      if (wallet && wallet.connected) {
        wallet.disconnect();
        setConnected(false);
      }
    };
  }, [wallet]);

  useEffect(() => {
    if (wallet && autoConnect) {
      wallet.connect();
      setAutoConnect(false);
    }

    return () => {};
  }, [wallet, autoConnect]);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const select = useCallback(() => setIsModalVisible(true), []);
  const close = useCallback(() => setIsModalVisible(false), []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connected,
        select,
        providerUrl,
        setProviderUrl,
        providerName:
          WALLET_PROVIDERS.find(({ url }) => url === providerUrl)?.name ??
          providerUrl,
      }}
    >
      {children}
      <Modal
        centered
        title="Select Wallet"
        opened={isModalVisible}
        onClose={close}
        radius={"md"}
        // styles={{
        //   modal: {
        //     backgroundColor: "rgb(15, 23, 42)",
        //     borderRadius: "5px",
        //   },
        //   title: {
        //     color: "#FFF",
        //   },
        // }}
        // okText="Connect"
        // visible={isModalVisible}
        // // okButtonProps={{ style: { display: "none" } }}
        // onCancel={close}
        // width={400}
      >
        {WALLET_PROVIDERS.map((provider) => {
          const onClick = function () {
            setProviderUrl(provider.url);
            setAutoConnect(true);
            close();
          };

          return (
            <Button
              key={provider.name}
              size="lg"
              fullWidth
              variant={providerUrl === provider.url ? "filled" : "subtle"}
              color={
                providerUrl === provider.url ? "rgb(99, 102, 241)" : undefined
              }
              onClick={onClick}
              style={{ justifyContent: "flex-start", color: "#FFF" }}
              leftIcon={
                <img
                  alt={`${provider.name}`}
                  width={20}
                  height={20}
                  src={provider.icon}
                  style={{ marginRight: 8 }}
                />
              }
            >
              {provider.name}
            </Button>
          );
        })}
      </Modal>
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("Missing wallet context");
  }

  const wallet = context.wallet;
  return {
    connected: context.connected,
    wallet: wallet,
    providerUrl: context.providerUrl,
    setProvider: context.setProviderUrl,
    providerName: context.providerName,
    select: context.select,
    connect() {
      wallet ? wallet.connect() : context.select();
    },
    disconnect() {
      wallet?.disconnect();
    },
  };
}
