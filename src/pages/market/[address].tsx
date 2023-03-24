import { Box, makeStyles, Tab } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { useWallet } from "@solana/wallet-adapter-react";
import { Col, Row, Select } from "antd";
import { nanoid } from "nanoid";
import numeral from "numeral";
import {
    useCallback, useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import styled from "styled-components";
import TradeHistoryChart from "../../components/TradeHistoryChart";

import { useTokenList } from "../../context/tokenList";

import CustomMarketDialog from "../../components/CustomMarketDialog";
import DeprecatedMarketsInstructions from "../../components/DeprecatedMarketsInstructions";
import FloatingNavBar from "../../components/layout/FloatingNavbar";
import Orderbook from "../../components/Orderbook";
import StandaloneBalancesDisplay from "../../components/StandaloneBalancesDisplay";
import TradeForm from "../../components/TradeForm";
import TradesTable from "../../components/TradesTable";
import UserInfoTable from "../../components/UserInfoTable";
import UserInfoDisabled from "../../components/UserInfoTable/UserInfoTableDisabled";
import {
    getMarketInfos, getTradePageUrl, MarketProvider,
    useMarket,
    useMarketsList
} from "../../utils/markets";
import { notify } from "../../utils/notifications";
import { fetchTokenPrice } from "../../utils/tokenApi";
import { createTheme, ThemeProvider } from "@mui/material";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
const TVChartContainer = dynamic(
    () => import("../../components/TradingView/index"),
    {
        ssr: false,
    }
);
interface TradePageProps {
    marketAddress: string
}

const { Option, OptGroup } = Select;

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-top: -4em;
  width: 98vw;
  justify-content: "center";
  align-items: "center";
  flex: 1;

  // padding: 16px 16px;

  scrollbar-width: none !important;
  // overflow-y: scroll;
  .borderNone .ant-select-selector {
    border: none !important;
  }
`;
const useStyles = makeStyles({

    root: {
        padding: 0,
        minHeight: 0,

        "& .Mui-selected": {
            backgroundColor: "#132235",
            color: "#E2E8F0",
            fontFamily: "Poppins",
            fontStyle: "normal",
            fontWeight: "400",
            fontSize: "11px",
            lineHeight: "12px",
            textTransform: "capitalize",
            border: "1px solid #132235",
            borderTopRadius: "5px",
            borderBottom: "none"
        },
        "& .MuiTab-root": {
            color: "#E2E8F0",
            fontFamily: "Poppins",
            fontStyle: "normal",
            fontWeight: "400",
            fontSize: "11px",
            lineHeight: "12px",
            textTransform: "capitalize",
            maxHeight: "30px",
            borderBottom: "none",
            minHeight: "30px",
            minWidth: "125px", padding: "0px"
        },
        "& .MuiTabs-indicator": {
            backgroundColor: "transparent"
        },
        "& .MuiTabs-flexContainer": {
            borderBottom: "1px solid #132235"
        },
        "& .iuIFQc": {
            minHeight: "10px !important"
        },
    },
});
const TradePage = ({ marketAddress }: TradePageProps) => {
    const theme = createTheme();
    const router = useRouter();



    const marketList = useMarketsList();
    const [headersList, setHeaders] = useState<any[]>([]);


    useEffect(() => {


        if (marketAddress && typeof window !== "undefined") {
            localStorage.setItem("marketAddress", JSON.stringify(marketAddress));
        }
        if (marketList.length != 0) {
            setHeaders(Object.keys(marketList[0]));
        }
    }, [marketAddress,]);
    // const history = useHistory();
    function setMarketAddress(address: string) {
        router.push(getTradePageUrl(address));
    }

    return (
        <ThemeProvider theme={theme}>
            <MarketProvider
                marketAddress={marketAddress}
                setMarketAddress={setMarketAddress}
            >
                <TradePageInner />
            </MarketProvider>
        </ThemeProvider>

    );
}

function TradePageInner() {
    const {
        market,
        marketName,
        customMarkets,
        setCustomMarkets,
        setMarketAddress
    } = useMarket();
    const markets = useMarketsList();

    const [handleDeprecated, setHandleDeprecated] = useState(false);
    const [addMarketVisible, setAddMarketVisible] = useState(false);
    const [selectedToken, setSelectedToken] = useState<any>(null);

    const { splTokenList } = useTokenList();
    const [dimensions, setDimensions] = useState({
        height: typeof window !== 'undefined' ? window.innerHeight : '100%',
        width: typeof window !== 'undefined' ? window.innerWidth : '100%'
    });

    useMemo(() => {
        //@ts-ignore
        let token = marketName?.substring(0, marketName?.indexOf("/"));
        let selectedToken: any = splTokenList.find(
            (elm: any) => elm.symbol.toUpperCase() === token?.toUpperCase()
        );

        if (
            selectedToken &&
            selectedToken.extensions &&
            selectedToken.extensions.coingeckoId
        ) {
            fetchTokenPrice(selectedToken.extensions.coingeckoId).then(
                (tokenData) => {
                    //@ts-ignore
                    setSelectedToken(tokenData);
                }
            );
        }
    }, [marketName]);

    const changeOrderRef =
        useRef<({ size, price }: { size?: number; price?: number }) => void>();

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                height: typeof window !== 'undefined' ? window.innerHeight : '100%',
                width: typeof window !== 'undefined' ? window.innerWidth : '100%'
            });
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const width = dimensions?.width;

    const componentProps = {
        onChangeOrderRef: (ref: any) => (changeOrderRef.current = ref),
        onPrice: useCallback(
            (price: any) => changeOrderRef.current && changeOrderRef.current({ price }),
            []
        ),
        onSize: useCallback(
            (size: any) => changeOrderRef.current && changeOrderRef.current({ size }),
            []
        )
    };
    const component = (() => {
        if (handleDeprecated) {
            return (
                <DeprecatedMarketsPage
                    switchToLiveMarkets={() => setHandleDeprecated(false)}
                />
            );
        }
        if (width < 1000) {
            return <RenderSmall {...componentProps} screenWidth={width} />;
        } else if (width < 1420) {
            return <RenderMedium {...componentProps} screenWidth={width} />;
        } else {
            return <RenderNormal {...componentProps} screenWidth={width} />;
        }
    })();

    const onAddCustomMarket = (customMarket: any) => {
        const marketInfo = getMarketInfos(customMarkets).some(
            (m) => m.address.toBase58() === customMarket.address
        );
        if (marketInfo) {
            notify({
                message: `A market with the given ID already exists`,
                type: "error"
            });
            return;
        }
        const newCustomMarkets = [...customMarkets, customMarket];
        setCustomMarkets(newCustomMarkets);
        setMarketAddress(customMarket.address);
    };

    const onDeleteCustomMarket = (address: string) => {
        const newCustomMarkets = customMarkets.filter((m) => m.address !== address);
        setCustomMarkets(newCustomMarkets);
    };

    return (
        <>
            <CustomMarketDialog
                visible={addMarketVisible}
                onClose={() => setAddMarketVisible(false)}
                onAddCustomMarket={onAddCustomMarket}
            />
            {/* <OpenOrdersDialog
        open={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
      /> */}
            <div className="page__row">
                <div
                    className="page__col"
                    style={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <div
                        style={{ maxWidth: "2500px", alignSelf: "center", display: "flex" }}
                    >
                        <Wrapper>
                            {width > 910 ? (
                                <FloatingNavBar>
                                    <Row
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-start",
                                            alignItems: "center",
                                            flexWrap: "nowrap",
                                            borderStyle: "solid",
                                            borderWidth: "1px",
                                            borderColor: "rgba(51, 66, 87, 0.6)",
                                            borderRadius: "5px",
                                            marginBottom: "20px",
                                            height: "60px",
                                            padding: "5px",
                                            marginLeft: width > 1400 ? "0px" : "30px",
                                            backgroundColor: "#080f19"
                                        }}
                                    >
                                        <Col flex={"auto"}>
                                            <Row
                                                style={{
                                                    height: "80px",

                                                    flexWrap: "nowrap",

                                                    justifyContent: "flex-start",
                                                    alignItems: "center"
                                                }}
                                            >
                                                <Col
                                                    flex={"300px"}
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        justifyContent: "flex-start",
                                                        alignItems: "center",

                                                        marginTop: 10,
                                                        marginBottom: 10,
                                                        paddingRight: 10
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                            margin: "15px",
                                                            borderRadius: 10
                                                        }}
                                                    >
                                                        <MarketSelector
                                                            markets={markets}
                                                            setHandleDeprecated={setHandleDeprecated}
                                                            placeholder={"Select market"}
                                                            customMarkets={customMarkets.filter((elm) => {
                                                                if (
                                                                    !elm.baseLabel?.startsWith("so") &&
                                                                    !elm.quoteLabel?.startsWith("so")
                                                                ) {
                                                                    return elm;
                                                                } else {
                                                                    return elm;
                                                                }
                                                            })}
                                                            onDeleteCustomMarket={onDeleteCustomMarket}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col flex={"50px"}>
                                                    <button
                                                        onClick={() => {
                                                            setAddMarketVisible(true);
                                                        }}
                                                    >
                                                        <Add
                                                            style={{
                                                                color: "rgb(99, 102, 241)",
                                                                border: "solid 1px rgb(99, 102, 241)",
                                                                borderRadius: "5px",
                                                                height: "25px",
                                                                width: "25px"
                                                            }}
                                                        />
                                                    </button>
                                                </Col>
                                                <Col
                                                    flex={"auto"}
                                                    style={{
                                                        justifyContent: "flex-start",
                                                        alignItems: "center",
                                                        alignSelf: "center",
                                                        flexDirection: "row",

                                                        display: "flex",
                                                        width: "100%",
                                                        gap: "30px"
                                                    }}
                                                >
                                                    <div
                                                        style={{ display: "flex", flexDirection: "column" }}
                                                    >
                                                        <span className="header-label">Market Price</span>
                                                        <span>
                                                            $
                                                            {selectedToken &&
                                                                numeral(
                                                                    selectedToken.marketData.current_price.usd
                                                                ).format("0,0.0000")}
                                                        </span>
                                                    </div>
                                                    <div
                                                        style={{ display: "flex", flexDirection: "column" }}
                                                    >
                                                        <span className="header-label">24h Volume</span>
                                                        <span>
                                                            $
                                                            {selectedToken &&
                                                                numeral(
                                                                    selectedToken.marketData.total_volume.usd
                                                                ).format("0,0.0000")}
                                                        </span>
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "flex-start",
                                                            justifyContent: "flex-start"
                                                        }}
                                                    >
                                                        <span className="header-label">Market Address</span>
                                                        <span>{market?.address.toBase58()}</span>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </FloatingNavBar>
                            ) : (
                                <FloatingNavBar>
                                    <Row
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            flexWrap: "nowrap",
                                            borderStyle: "solid",
                                            borderWidth: "2px",
                                            borderColor: "rgba(51, 66, 87, 0.6)",
                                            borderRadius: "5px",
                                            boxShadow: "rgb(15 23 42 / 30%) 0px 4px 16px 2px",
                                            marginBottom: "20px",
                                            marginLeft: "5px",
                                            marginRight: "5px",
                                            height: "60px"
                                        }}
                                    >
                                        <Col flex={"auto"}>
                                            <Row
                                                style={{
                                                    // height: "80px",

                                                    // flexWrap: "nowrap",
                                                    justifyContent: "flex-start",
                                                    alignItems: "center"
                                                }}
                                            >
                                                <Col
                                                    flex={"300px"}
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        justifyContent: "flex-start",
                                                        alignItems: "center",
                                                        marginLeft: "2%",
                                                        flexWrap: "wrap",

                                                        marginTop: 10,
                                                        marginBottom: 10,
                                                        paddingRight: 10
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            padding: "0.2em",
                                                            width: "100%",
                                                            margin: "15px",
                                                            borderRadius: 10
                                                        }}
                                                    >
                                                        <MarketSelector
                                                            markets={markets}
                                                            setHandleDeprecated={setHandleDeprecated}
                                                            placeholder={"Select market"}
                                                            customMarkets={customMarkets.filter((elm) => {
                                                                if (
                                                                    !elm.baseLabel?.startsWith("so") &&
                                                                    !elm.quoteLabel?.startsWith("so")
                                                                ) {
                                                                    return elm;
                                                                } else {
                                                                    return null;
                                                                }
                                                            })}
                                                            onDeleteCustomMarket={onDeleteCustomMarket}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col flex={"50px"}>
                                                    <button
                                                        onClick={() => {
                                                            setAddMarketVisible(true);
                                                        }}
                                                    >
                                                        <Add
                                                            style={{
                                                                color: "rgb(99, 102, 241)",
                                                                border: "solid 1px rgb(99, 102, 241)",
                                                                borderRadius: "5px",
                                                                height: "25px",
                                                                width: "25px"
                                                            }}
                                                        />
                                                    </button>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </FloatingNavBar>
                            )}
                            {component}
                        </Wrapper>
                    </div>
                </div>
            </div>
        </>
    );
}

function MarketSelector({
    markets,
    placeholder,
    setHandleDeprecated,
    customMarkets,
    onDeleteCustomMarket
}: {
    markets: any,
    placeholder: any,
    setHandleDeprecated: any,
    customMarkets: any,
    onDeleteCustomMarket: any
}) {
    const { splTokenList } = useTokenList();
    const { market, setMarketAddress } = useMarket();

    const getTokenUrl = (symbol: string) => {
        let token: any = splTokenList.find((token: any) => token.symbol === symbol);

        if (!token) {
            return null;
        } else {
            return (
                <img
                    src={token.logoURI}
                    style={{
                        width: 25,
                        height: 25,
                        objectFit: "contain",
                        borderRadius: 25
                    }}
                    alt=""
                />
            );
        }
    };
    const onSetMarketAddress = (marketAddress: string) => {

        setMarketAddress(marketAddress);
    };

    const extractBase = (a: any) => a.split("/")[0];
    const extractQuote = (a: any) => a.split("/")[1];

    const selectedMarket = getMarketInfos(customMarkets)
        .find(
            (proposedMarket) =>
                market?.address && proposedMarket.address.equals(market.address)
        )
        ?.address?.toBase58();
    //changeMarket(ex)

    return (
        <Select
            showSearch
            size={"middle"}
            style={{
                border: "1px solid rgba(50, 65, 87, 0.6)",
                backgroundColor: "rgb(15, 23, 42)",
                color: "rgb(255, 255, 255)",
                fontFamily: "Poppins",
                padding: "0.3em",
                width: "100%",
                boxShadow: "none !important",
                borderRadius: "5px"
            }}
            placeholder={placeholder || "Select a market"}
            optionFilterProp="name"
            onSelect={onSetMarketAddress}
            listHeight={400}
            value={selectedMarket}
            dropdownStyle={{
                boxShadow: "none",
                borderRadius: "5px",
                border: "1px none rgb(206, 216, 222)",
                backgroundColor: "rgb(15, 23, 42)",
                color: "rgba(255, 255, 255,0.5) !important"
            }}
            filterOption={(input, option) =>
                option?.name?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
        >
            <OptGroup>
                {markets
                    .sort((a: any, b: any) =>
                        extractQuote(a.name) === "USDT" && extractQuote(b.name) !== "USDT"
                            ? -1
                            : extractQuote(a.name) !== "USDT" &&
                                extractQuote(b.name) === "USDT"
                                ? 1
                                : 0
                    )
                    .sort((a: any, b: any) =>
                        extractBase(a.name) < extractBase(b.name)
                            ? -1
                            : extractBase(a.name) > extractBase(b.name)
                                ? 1
                                : 0
                    )
                    .map(({ address, name, deprecated }: any, i: number) => {
                        return (
                            <Option
                                value={address.toBase58()}
                                key={nanoid()}
                                name={name}
                                style={{
                                    padding: "10px"
                                }}
                            >
                                {/* {name} */}
                                <Row>
                                    <Col flex={"auto"}>
                                        {getTokenUrl(name.substring(0, name.lastIndexOf("/")))}
                                    </Col>
                                    <Col flex="auto">
                                        {name} {deprecated ? " (Deprecated)" : null}
                                    </Col>
                                </Row>
                            </Option>
                        );
                    })}
                {customMarkets &&
                    customMarkets.length > 0 &&
                    customMarkets.map(({ address, name }: any, i: number) => {
                        return (
                            <Option
                                value={address}
                                key={nanoid()}
                                name={name}
                                style={{
                                    padding: "10px"

                                    // @ts-ignore
                                    // backgroundColor: i % 2 === 0 ? "rgb(39, 44, 61)" : null
                                }}
                            >
                                <Row>
                                    <Col flex={"auto"}>
                                        {getTokenUrl(name.substring(0, name.lastIndexOf("/")))}
                                    </Col>
                                    <Col flex="auto">{name}</Col>
                                </Row>
                            </Option>
                        );
                    })}
            </OptGroup>
        </Select>
    );
}

const DeprecatedMarketsPage = ({ switchToLiveMarkets }: { switchToLiveMarkets: any }) => {
    return (
        <>
            <Row>
                <Col flex="auto">
                    <DeprecatedMarketsInstructions
                        switchToLiveMarkets={switchToLiveMarkets}
                    />
                </Col>
            </Row>
        </>
    );
};

const RenderNormal = ({ onChangeOrderRef, onPrice, onSize, screenWidth }: { onChangeOrderRef: any, onPrice: any, onSize: any, screenWidth: any }) => {
    const [chartValue, setChartValue] = useState("1");
    const [tvChartValue, setTVChartValue] = useState(process.env.NEXT_PUBLIC_DISPLAY_TRADING_VIEW);
    const [orderValue, setOrderValue] = useState("1");
    const { splTokenList } = useTokenList();

    const { marketName } = useMarket();
    const { connected } = useWallet();
    const [selectedFirstTokenInfo, setSelectedFirstTokenInfo] = useState<any>({
        tokenId: "solana",
        name: "Solana"
    });
    const classes = useStyles();

    const handleTVChartChange = (event: any, newValue: string) => {
        setTVChartValue(newValue);
    };
    const handleOrderChange = (event: any, newValue: string) => {
        if (newValue === "2") {
            //history.push("/swap");
        } else {
            setOrderValue(newValue);
        }
    };
    const setSelectedTokenInfo = useCallback(() => {
        const getTokenId = (symbol: string) => {
            let token: any = splTokenList.find((token: any) => token.symbol === symbol);
            if (token) {
                return {
                    tokenId: token.extensions.coingeckoId,
                    name: token.name
                };
            } else {
                return null;
            }
        };
        if (marketName) {
            let baseQuote: string = marketName?.split("/")[0];
            let info = getTokenId(baseQuote);
            if (info) {
                setSelectedFirstTokenInfo(info);
            }
        }
    }, [marketName, splTokenList]);
    useMemo(() => {
        setSelectedTokenInfo();
    }, [setSelectedTokenInfo]);
    return (
        <>
            <Row
                style={{
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "nowrap",
                    flexGrow: 1,

                    flex: 1,
                    position: "relative",
                    marginBottom: 30,
                    gap: "20px"
                }}
            >
                <Col flex={"390px"}>
                    <div className="trade-card-container">
                        <TabContext value={orderValue}>
                            <Box sx={{ borderBottom: 1, borderColor: "#132235" }}>
                                <TabList
                                    onChange={handleOrderChange}
                                    className={classes.root}
                                    scrollButtons="auto"
                                    TabIndicatorProps={{ style: { minWidth: "auto", minHeight: "0px" } }}
                                >
                                    <Tab label={`Open Book`} value="1" style={{ minHeight: "30px" }} />
                                </TabList>
                            </Box>

                            <TabPanel value="1" className={classes.root}>
                                <TradeForm setChangeOrderRef={onChangeOrderRef} small={false} />
                            </TabPanel>
                        </TabContext>
                    </div>
                </Col>
                <Col flex={"auto"}>
                    <div className="tv-card-container">
                        <TabContext value={tvChartValue}>
                            <Box sx={{ borderBottom: 1, borderColor: "#132235" }}>
                                <TabList
                                    onChange={handleTVChartChange}
                                    className={classes.root}
                                    scrollButtons="auto"
                                    TabIndicatorProps={{ style: { minWidth: "auto" } }}
                                >
                                    <Tab label={`Trading View`} value="1" />
                                    <Tab label={`Simple Chart`} value="2" />
                                </TabList>
                            </Box>
                            {
                                Number(process.env.NEXT_PUBLIC_DISPLAY_TRADING_VIEW) == 1 && <TabPanel value="1" className={classes.root}>
                                    <TVChartContainer />
                                </TabPanel>
                            }

                            <TabPanel value="2" className={classes.root}>
                                <TradeHistoryChart
                                    coingeckoId={selectedFirstTokenInfo.tokenId}
                                    coinName={selectedFirstTokenInfo.name}
                                />
                            </TabPanel>
                        </TabContext>
                    </div>
                </Col>

                <Col flex={"390px"}>
                    <div className="trade-card-container">
                        <TabContext value={chartValue}>
                            <Box sx={{ borderBottom: 1, borderColor: "#132235" }}>
                                <TabList
                                    // onChange={handleChartChange}
                                    className={classes.root}
                                    scrollButtons="auto"
                                    TabIndicatorProps={{ style: { minWidth: "auto" } }}
                                >
                                    <Tab label={`Manage Accounts`} value="1" />
                                </TabList>
                            </Box>
                            <TabPanel value="1" className={classes.root}>
                                <StandaloneBalancesDisplay smallScreen={false} />
                            </TabPanel>
                        </TabContext>
                    </div>
                </Col>
            </Row>
            <Row
                style={{
                    justifyContent: "space-evenly",
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "nowrap",
                    flexGrow: 1,
                    flexShrink: 1,
                    flex: 1,
                    position: "relative",
                    marginBottom: 30,
                    gap: "20px"
                }}
            >
                <Col flex={"480px"}>
                    <div className="orderbook-card-container">
                        <TabContext value={chartValue}>
                            <Box
                                sx={{ borderBottom: 1, borderColor: "#132235", height: "30px" }}
                            >
                                <TabList
                                    // onChange={handleChartChange}
                                    className={classes.root}
                                    scrollButtons="auto"
                                    TabIndicatorProps={{ style: { minWidth: "auto" } }}
                                >
                                    <Tab label={`Order Book`} value="1" />
                                    <Tab label={`Market Depth`} value="2" />
                                </TabList>
                            </Box>
                            <TabPanel value="1" className={classes.root}>
                                <Orderbook
                                    smallScreen={false}
                                    onPrice={onPrice}
                                    onSize={onSize}
                                />
                            </TabPanel>
                        </TabContext>
                    </div>
                </Col>
                <Col flex={"480px"}>
                    <div className="orderbook-card-container">
                        <TabContext value={chartValue}>
                            <Box
                                sx={{ borderBottom: 1, borderColor: "#132235", height: "30px" }}
                            >
                                <TabList
                                    // onChange={handleChartChange}
                                    className={classes.root}
                                    scrollButtons="auto"
                                    TabIndicatorProps={{ style: { minWidth: "auto" } }}
                                >
                                    <Tab label={`Recent Trades`} value="1" />
                                </TabList>
                            </Box>
                            <TabPanel value="1" className={classes.root}>
                                <TradesTable smallScreen={false} />
                            </TabPanel>
                        </TabContext>
                    </div>
                </Col>

                <Col flex={"auto"}>
                    {connected ? <UserInfoTable /> : <UserInfoDisabled />}
                </Col>
            </Row>
        </>
    );
};
const RenderMedium = ({ onChangeOrderRef, onPrice, onSize, screenWidth }: { onChangeOrderRef: any, onPrice: any, onSize: any, screenWidth: any }) => {
    const [chartValue, setChartValue] = useState("1");
    const [tvChartValue, setTVChartValue] = useState(process.env.NEXT_PUBLIC_DISPLAY_TRADING_VIEW);
    const [orderValue, setOrderValue] = useState("1");
    const { splTokenList } = useTokenList();
    // const history = useHistory();
    const { marketName } = useMarket();
    const { connected } = useWallet();
    const [selectedFirstTokenInfo, setSelectedFirstTokenInfo] = useState<any>({
        tokenId: "solana",
        name: "Solana"
    });
    const classes = useStyles();
    // const handleChartChange = (event, newValue) => {
    //   setChartValue(newValue);
    // };
    const handleTVChartChange = (event: any, newValue: string) => {
        setTVChartValue(newValue);
    };
    const handleOrderChange = (event: any, newValue: string) => {

        setOrderValue(newValue);

    };
    const setSelectedTokenInfo = useCallback(() => {
        const getTokenId = (symbol: string) => {
            let token: any = splTokenList.find((token: any) => token.symbol === symbol);
            if (token) {
                return {
                    tokenId: token.extensions.coingeckoId,
                    name: token.name
                };
            } else {
                return null;
            }
        };
        if (marketName) {
            let baseQuote: string = marketName?.split("/")[0];
            let info = getTokenId(baseQuote);
            if (info) {
                setSelectedFirstTokenInfo(info);
            }
        }
    }, [marketName, splTokenList]);
    useMemo(() => {
        setSelectedTokenInfo();
    }, [setSelectedTokenInfo]);

    return (
        <>
            <Row
                style={{
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "nowrap",
                    flexGrow: 1,

                    flex: 1,
                    position: "relative",
                    marginBottom: 30,
                    marginLeft: 30,
                    gap: "20px"
                }}
            >
                <Col flex={"360px"}>
                    {" "}
                    <div className="trade-card-container">
                        <TabContext value={chartValue}>
                            <Box sx={{ borderBottom: 1, borderColor: "#132235" }}>
                                <TabList
                                    onChange={handleOrderChange}
                                    className={classes.root}
                                    scrollButtons="auto"
                                    TabIndicatorProps={{ style: { minWidth: "auto" } }}
                                >
                                    <Tab label={`Open Book`} value="1" />
                                    <Tab label={`Smart Swap`} value="2" />
                                </TabList>
                            </Box>

                            <TabPanel value="1" className={classes.root}>
                                <TradeForm setChangeOrderRef={onChangeOrderRef} small={false} />
                            </TabPanel>
                        </TabContext>
                    </div>
                </Col>
                <Col flex={"auto"}>
                    <div className="tv-card-container">
                        <TabContext value={chartValue}>
                            <Box sx={{ borderBottom: 1, borderColor: "#132235" }}>
                                <TabList
                                    onChange={handleTVChartChange}
                                    className={classes.root}
                                    scrollButtons="auto"
                                    TabIndicatorProps={{ style: { minWidth: "auto" } }}
                                >
                                    <Tab label={`Trading View`} value="1" />
                                    <Tab label={`Simple Chart`} value="2" />
                                </TabList>
                            </Box>

                            <TabPanel value="1" className={classes.root}>
                                <TVChartContainer />
                            </TabPanel>
                            <TabPanel value="2" className={classes.root}>
                                {" "}
                                <TradeHistoryChart
                                    coingeckoId={selectedFirstTokenInfo.tokenId}
                                    coinName={selectedFirstTokenInfo.name}
                                />
                            </TabPanel>
                        </TabContext>
                    </div>
                </Col>
            </Row>
            <Row
                style={{
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "nowrap",
                    flexGrow: 1,

                    flex: 1,
                    position: "relative",
                    marginBottom: 30,
                    marginLeft: 30,
                    gap: "20px"
                }}
            >
                <Col flex={"360px"}>
                    <div className="trade-card-container">
                        <TabContext value={chartValue}>
                            <Box
                                sx={{ borderBottom: 1, borderColor: "#132235", height: "30px" }}
                            >
                                <TabList
                                    // onChange={handleChartChange}
                                    className={classes.root}
                                    scrollButtons="auto"
                                    TabIndicatorProps={{ style: { minWidth: "auto" } }}
                                >
                                    <Tab label={`Recent Trades`} value="1" />
                                </TabList>
                            </Box>
                            <TabPanel value="1" className={classes.root}>
                                <TradesTable smallScreen={false} />
                            </TabPanel>
                        </TabContext>
                    </div>
                </Col>

                <Col flex={"auto"}>
                    <div className="trade-card-container">
                        <TabContext value={chartValue}>
                            <Box
                                sx={{ borderBottom: 1, borderColor: "#132235", height: "30px" }}
                            >
                                <TabList
                                    // onChange={handleChartChange}
                                    className={classes.root}
                                    scrollButtons="auto"
                                    TabIndicatorProps={{ style: { minWidth: "auto" } }}
                                >
                                    <Tab label={`Order Book`} value="1" />
                                    <Tab label={`Market Depth`} value="2" />
                                </TabList>
                            </Box>
                            <TabPanel value="1" className={classes.root}>
                                <Orderbook
                                    smallScreen={false}
                                    onPrice={onPrice}
                                    onSize={onSize}
                                />
                            </TabPanel>
                        </TabContext>
                    </div>
                </Col>
                <Col flex={"auto"}>
                    <div className="trade-card-container">
                        <TabContext value={chartValue}>
                            <Box
                                sx={{ borderBottom: 1, borderColor: "#132235", height: "30px" }}
                            >
                                <TabList
                                    // onChange={handleChartChange}
                                    className={classes.root}
                                    scrollButtons="auto"
                                    TabIndicatorProps={{ style: { minWidth: "auto" } }}
                                >
                                    <Tab label={`Manage Accounts`} value="1" />
                                </TabList>
                            </Box>
                            <TabPanel value="1" className={classes.root}>
                                <StandaloneBalancesDisplay smallScreen={true} />
                            </TabPanel>
                        </TabContext>
                    </div>
                </Col>
            </Row>
            <Row
                style={{
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "nowrap",
                    flexGrow: 1,

                    flex: 1,
                    position: "relative",
                    marginBottom: 30,
                    marginLeft: 30,
                    gap: "20px"
                }}
            >
                <Col flex={"auto"}>
                    <UserInfoTable />
                </Col>
            </Row>
        </>
    );
};

const RenderSmall = ({ onChangeOrderRef, onPrice, onSize, screenWidth }: { onChangeOrderRef: any, onPrice: any, onSize: any, screenWidth: any }) => {
    const [chartValue, setChartValue] = useState("1");
       const [tvChartValue, setTVChartValue] = useState(process.env.NEXT_PUBLIC_DISPLAY_TRADING_VIEW);

    const { splTokenList } = useTokenList();

    const { marketName } = useMarket();
    const { connected } = useWallet();
    const [selectedFirstTokenInfo, setSelectedFirstTokenInfo] = useState<any>({
        tokenId: "solana",
        name: "Solana"
    });
    const classes = useStyles();

    const handleTVChartChange = (event: any, newValue: string) => {
        setTVChartValue(newValue);
    };

    const setSelectedTokenInfo = useCallback(() => {
        const getTokenId = (symbol: string) => {
            let token: any = splTokenList.find((token: any) => token.symbol === symbol);
            if (token) {
                return {
                    tokenId: token.extensions.coingeckoId,
                    name: token.name
                };
            } else {
                return null;
            }
        };
        if (marketName) {
            let baseQuote: string = marketName?.split("/")[0];
            let info = getTokenId(baseQuote);
            if (info) {
                setSelectedFirstTokenInfo(info);
            }
        }
    }, [marketName, splTokenList]);
    useMemo(() => {
        setSelectedTokenInfo();
    }, [setSelectedTokenInfo]);

    return (
        <Row
            style={{
                minHeight: "400px",
                flexWrap: "nowrap"
            }}
        >
            <Col flex="auto">
                <Row
                    style={{ marginTop: "20px", marginLeft: "5px", marginRight: "5px" }}
                >
                    <Col flex={"auto"}>
                        <div className="tv-card-container">
                            <TabContext value={chartValue}>
                                <Box sx={{ borderBottom: 1, borderColor: "#132235" }}>
                                    <TabList
                                        onChange={handleTVChartChange}
                                        className={classes.root}
                                        scrollButtons="auto"
                                        TabIndicatorProps={{ style: { minWidth: "auto" } }}
                                    >
                                        <Tab label={`Trading View`} value="1" />
                                        <Tab label={`Simple Chart`} value="2" />
                                    </TabList>
                                </Box>

                                <TabPanel value="1" className={classes.root}>
                                    {/* <TVChartContainer /> */}
                                </TabPanel>
                                <TabPanel value="2" className={classes.root}>
                                    {" "}
                                    <TradeHistoryChart
                                        coingeckoId={selectedFirstTokenInfo.tokenId}
                                        coinName={selectedFirstTokenInfo.name}
                                    />
                                </TabPanel>
                            </TabContext>
                        </div>
                    </Col>
                </Row>
                <Row
                    style={{ marginTop: "20px", marginLeft: "5px", marginRight: "5px" }}
                >
                    <Col flex={"auto"}>
                        <div className="trade-card-container">
                            <TabContext value={chartValue}>
                                <Box sx={{ borderBottom: 1, borderColor: "#132235" }}>
                                    <TabList
                                        // onChange={handleChartChange}
                                        className={classes.root}
                                        scrollButtons="auto"
                                        TabIndicatorProps={{ style: { minWidth: "auto" } }}
                                    >
                                        <Tab label={`Open Book`} value="1" />
                                        <Tab label={`Smart Swap`} value="2" />
                                    </TabList>
                                </Box>

                                <TabPanel value="1" className={classes.root}>
                                    <TradeForm
                                        setChangeOrderRef={onChangeOrderRef}
                                        small={true}
                                    />
                                </TabPanel>
                            </TabContext>
                        </div>
                    </Col>
                </Row>

                <Row
                    style={{ marginTop: "20px", marginLeft: "5px", marginRight: "5px" }}
                >
                    <Col flex={"auto"}>
                        <div className="trade-card-container">
                            <TabContext value={chartValue}>
                                <Box sx={{ borderBottom: 1, borderColor: "#132235" }}>
                                    <TabList
                                        // onChange={handleChartChange}
                                        className={classes.root}
                                        scrollButtons="auto"
                                        TabIndicatorProps={{ style: { minWidth: "auto" } }}
                                    >
                                        <Tab label={`Manage Accounts`} value="1" />
                                    </TabList>
                                </Box>
                                <TabPanel value="1" className={classes.root}>
                                    <StandaloneBalancesDisplay smallScreen={true} />
                                </TabPanel>
                            </TabContext>
                        </div>
                    </Col>
                </Row>
                <Row
                    style={{ marginTop: "20px", marginLeft: "5px", marginRight: "5px" }}
                >
                    <Col flex={"auto"}>
                        <div className="trade-card-container">
                            <TabContext value={chartValue}>
                                <Box
                                    sx={{
                                        borderBottom: 1,
                                        borderColor: "#132235",
                                        height: "30px"
                                    }}
                                >
                                    <TabList
                                        // onChange={handleChartChange}
                                        className={classes.root}
                                        scrollButtons="auto"
                                        TabIndicatorProps={{ style: { minWidth: "auto" } }}
                                    >
                                        <Tab label={`Order Book`} value="1" />
                                        <Tab label={`Market Depth`} value="2" />
                                    </TabList>
                                </Box>
                                <TabPanel value="1" className={classes.root}>
                                    {" "}
                                    <Orderbook
                                        smallScreen={true}
                                        onPrice={onPrice}
                                        onSize={onSize}
                                    />
                                </TabPanel>
                            </TabContext>
                        </div>
                    </Col>
                </Row>
                <Row
                    style={{ marginTop: "20px", marginLeft: "5px", marginRight: "5px" }}
                >
                    <Col flex={"auto"}>
                        <div className="trade-card-container">
                            <TabContext value={chartValue}>
                                <Box
                                    sx={{
                                        borderBottom: 1,
                                        borderColor: "#132235",
                                        height: "30px"
                                    }}
                                >
                                    <TabList
                                        // onChange={handleChartChange}
                                        className={classes.root}
                                        scrollButtons="auto"
                                        TabIndicatorProps={{ style: { minWidth: "auto" } }}
                                    >
                                        <Tab label={`Recent Trades`} value="1" />
                                    </TabList>
                                </Box>
                                <TabPanel value="1" className={classes.root}>
                                    <TradesTable smallScreen={true} />
                                </TabPanel>
                            </TabContext>
                        </div>
                    </Col>
                </Row>
                <Row
                    style={{ marginTop: "20px", marginLeft: "5px", marginRight: "5px" }}
                >
                    <Col flex={"auto"}>
                        <UserInfoTable />
                    </Col>
                </Row>
            </Col>
        </Row>
    );
};
//TradePage.ssr = false;

export async function getServerSideProps(context: any) {
    const { query } = context;
    context.address = query.address;

    // Your code here...

    return {
        props: {
            marketAddress: context.address,
            // Your props here...
        },
    };
}
export default TradePage