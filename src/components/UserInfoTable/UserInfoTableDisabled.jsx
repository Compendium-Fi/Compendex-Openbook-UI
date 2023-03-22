import { useState } from "react";
import BalancesTable from "./BalancesTable";
import OpenOrderTable from "./OpenOrderTable";
import { Box, makeStyles, Tab } from "@material-ui/core";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import styled from "styled-components";
import { useBalances, useMarket, useOpenOrders } from "../../utils/markets";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import WalletConnect from "../WalletConnect";

const Wrapper = styled.div`
  margin: 0px;
  padding: 0px;
  // background-color: #1a2029;
`;
function FloatingElement({
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
//const { TabPane } = Tabs;
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
      minWidth: "125px"
    },
    "& .MuiTabs-indicator": {
      backgroundColor: "transparent"
    },
    "& .MuiTabs-flexContainer": {
      borderBottom: "1px solid #132235"
    },
    "& .iuIFQc": {
      minHeight: "10px !important"
    }
  }
});
export default function UserInfoDisabled() {
  const [value, setValue] = useState("1");
  const classes = useStyles();
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const { market } = useMarket();
  return (
    <FloatingElement
      style={{
        flex: 1,
        // backgroundColor: "transparent",
        height: "553px",
        overflowY: "hidden",
        scrollbarWidth: "none",
        scrollbarColor: "blue",
        borderRadius: "5px",
        backgroundColor: "#080f19",
        border: "1px solid #132235",
        padding: "0px !important",
        margin: "0px !important"
      }}
    // className="info-table"
    >
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "#132235" }}>
          <TabList
            onChange={handleChange}
            className={classes.root}
            scrollButtons="auto"
            TabIndicatorProps={{ style: { minWidth: "auto" } }}
          >
            <Tab label={`Open Orders`} value="1" className={classes.root} />
            <Tab label={`Recent Trade History`} value="2" className={classes.root} />
            <Tab label={`Balances`} value="3" className={classes.root} />
            {market && market.supportsSrmFeeDiscounts && (
              <Tab label={`Fee discounts`} value="4" className={classes.root} />
            )}
          </TabList>
        </Box>

        <TabPanel value="1" className={classes.root}>
          <div className="inner-tab">
            <div className="news-item">
              <div className="left-item">
                <AccountBalanceWalletIcon
                  style={{ color: "rgb(119, 145, 224)" }}
                />
                <div className="text-connect">
                  Please connect your wallet to utilize Openbook functions ,
                  view balances, or access your open orders.
                </div>
              </div>
              <div className="header__user wallet-btn">
                <WalletConnect />
              </div>
            </div>
          </div>
        </TabPanel>

      </TabContext>


    </FloatingElement>
  );
}

const OpenOrdersTab = () => {
  const openOrders = useOpenOrders();

  return <OpenOrderTable openOrders={openOrders} />;
};

const BalancesTab = () => {
  const balances = useBalances();

  return <BalancesTable balances={balances} />;
};
