import axios from "axios";

export const fetchTokenPrice = async (tokenId: string) => {
  try {
    let res = await axios.get(
      "https://api.coingecko.com/api/v3/coins/" + tokenId
    );

    let token = {
      symbol: res.data.symbol,
      name: res.data.name,
      image: res.data.image.large,
      marketData: res.data.market_data,
      id: tokenId
    };
    return token;
  } catch (error: any) {
    console.log("error", error.message);
    return {
      symbol: null,
      name: null,
      image: null,
      marketData: null,
      id: tokenId
    };
  }
};
