import axios from "axios";
import { useEffect, useLayoutEffect, useState } from "react";

import WalletConnect from "./WalletConnect";

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}
const MainHeader = () => {
  const [width] = useWindowSize();
  const [tokenPrice, setTokenPrice] = useState(null);

  // const history = useHistory();
  // const location = useLocation();

  const getTokenPrice = async () => {
    try {
      let result = await axios.get(
        "https://coins.llama.fi/prices/current/solana:5Wsd311hY8NXQhkt9cWHwTnqafk7BGEbLu8Py3DSnPAr"
      );
      if (result.data) {
        setTokenPrice(
          result.data.coins[
            "solana:5Wsd311hY8NXQhkt9cWHwTnqafk7BGEbLu8Py3DSnPAr"
          ].price
        );
      }
    } catch (error) { }
  };

  useEffect(() => {
    getTokenPrice();
  }, []);

  return (
    <div className="header-container">
      <div className="header smallHeader">
        <div className="MainHeader-content">
          <button
            className="header-content"
            style={width > 910 ? {} : { marginRight: "0em", marginLeft: "1em" }}
          >
            <img src={"/assets/img/compendex2.png"} alt="" />
            <span
              id="compendex_name"
              style={{
                fontFamily: "Poppins",
                fontSize: "20px",
                fontWeight: 600,
                color: "rgb(255, 255, 255)",
                marginLeft: "0.6em"
              }}
            >
              Compendex
            </span>
          </button>
        </div>
        <div className="header-content-mobile">
          <button
            className="header__logo"
            onClick={() => {
              if (width > 910) {
                history.push("/");
              } else {
                toggleSideBar();
              }
            }}
            style={width > 910 ? {} : { marginRight: "0em", marginLeft: "1em" }}
          >
            <img src={"assets/img/compendex2.png"} alt="" />
            <span
              id="compendex_name"
              style={{
                fontFamily: "Poppins",
                fontSize: "20px",
                fontWeight: 600,
                color: "rgb(255, 255, 255)",
                marginLeft: "0.6em"
              }}
            >
              Compendex
            </span>
          </button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            gap: "10px"
          }}
        >
          <div
            className="header_adr"
            style={{
              justifyContent: "space-evenly",
              alignItems: "center",

              minWidth: 110,
              display: "flex"
            }}
          >
            <div className="sol_place_holder">
              <img src={"/assets/img/sol.png"} alt="" />
              <span>SOL</span>
            </div>
          </div>
          <div className="header_place_holder">
            <img src={"/assets/img/cmfi_ticker.png"} alt="" />
            <span>${tokenPrice && tokenPrice.toFixed(4)}</span>
          </div>
          <button
            className="header__logo menu-icon"
            style={{ marginRight: "-10px" }}
          ></button>
          <a className="header__user wallet-btn">
            <WalletConnect />
          </a>
        </div>
      </div>
    </div>
  );
};
MainHeader.ssr = false;
export default MainHeader;
