

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { SnackbarProvider } from "notistack";
import { useMemo } from "react";

import {
    ConnectionProvider,
    useConnectionConfig
} from "../utils/connection";
import { ReferrerProvider } from "../utils/referrer";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { BitpieWalletAdapter } from "@solana/wallet-adapter-bitpie";
import { BloctoWalletAdapter } from "@solana/wallet-adapter-blocto";
import { ExodusWalletAdapter } from "@solana/wallet-adapter-exodus";
import { LedgerWalletAdapter } from "@solana/wallet-adapter-ledger";
import { MathWalletAdapter } from "@solana/wallet-adapter-mathwallet";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import {
    SolletExtensionWalletAdapter,
    SolletWalletAdapter
} from "@solana/wallet-adapter-sollet";

import SplTokenProvider from "../context/tokenList";
require("@solana/wallet-adapter-react-ui/styles.css");

function AppImpl({ children }: { children: any }) {
    const { endpoint } = useConnectionConfig();
    const network = useMemo(() => endpoint as WalletAdapterNetwork, [endpoint]);
    const wallets = useMemo(
        () => [
            new SolletWalletAdapter({ network }),
            new SolletExtensionWalletAdapter({ network }),
            new LedgerWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new PhantomWalletAdapter(),
            new MathWalletAdapter(),
            new ExodusWalletAdapter(),
            new BloctoWalletAdapter(),
            new BitpieWalletAdapter()
        ],
        [network]
    );
    return (

        <MantineProvider theme={{ colorScheme: "light", primaryColor: "dark" }}>
            <Notifications />
            <ConnectionProvider>
                <ReferrerProvider>
                    <WalletProvider wallets={wallets}>
                        <WalletModalProvider>
                            <SplTokenProvider>
                                {/*@ts-ignore*/}
                                <SnackbarProvider>

                                    <div className="page">
                                        {children}
                                    </div>

                                </SnackbarProvider>
                            </SplTokenProvider>
                        </WalletModalProvider>
                    </WalletProvider>
                </ReferrerProvider>
            </ConnectionProvider>

        </MantineProvider>

    );
}

const MainLayout = ({ children }: { children: any }) => {
    return (

        <ConnectionProvider>
            <AppImpl>
                {children}
            </AppImpl>

        </ConnectionProvider>

    );
}
MainLayout.ssr = false;
export default MainLayout
