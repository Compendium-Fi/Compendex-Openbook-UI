// import { BonfidaTrade } from "./types";
//https://dry-ravine-67635.herokuapp.com/
// export default class BonfidaApi {
//   //static URL: string = 'https://serum-api.bonfida.com/';
//   static URL: string = "https://dry-ravine-67635.herokuapp.com/";
//   static async get(path: string) {
//     try {
//       const response = await fetch(this.URL + path);
//       if (response.ok) {
//         const responseJson = await response.json();
//         return responseJson.success ? responseJson.data : null;
//       }
//     } catch (err) {
//       console.log(`Error fetching from Bonfida API ${path}: ${err}`);
//     }
//     return null;
//   }

//   static async getRecentTrades(
//     marketAddress: string
//   ): Promise<BonfidaTrade[] | null> {
//     return BonfidaApi.get(`trade/address?market=${marketAddress}`);
//   }
// }

// //export const BONFIDA_DATA_FEED = 'https://serum-api.bonfida.com/tv';
// export const BONFIDA_DATA_FEED = "https://api.raydium.io/v1/dex/tv/";
import { BonfidaTrade, BonfidaHistory } from "../utils/types";
export default class BonfidaApi {
  static URL: string =
    process.env.REACT_APP_CHART_API || "https://tradingview.compendex.xyz/";
  static async get(path: string) {
    try {
      const response = await fetch(this.URL + path);
      if (response.ok) {
        const responseJson = await response.json();
        if (responseJson.s && responseJson.s === "ok") {
          return responseJson;
        }
        if (path === "pairs" && Array.isArray(responseJson)) {
          return responseJson;
        }
        return responseJson.success ? responseJson.data : null;
      }
    } catch (err) {
      console.log(`Error fetching from Bonfida API ${path}: ${err}`);
    }
    return null;
  }
  static async getRecentTrades(
    marketAddress: string
  ): Promise<BonfidaTrade[] | null> {
    return BonfidaApi.get(`trades/address/${marketAddress}`);
  }
  static async getLastDay(symbol: string): Promise<BonfidaHistory | null> {
    const to = Math.floor(new Date().getTime() / 1000);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 1);
    const from = Math.floor(fromDate.getTime() / 1000);
    return BonfidaApi.get(
      `tv/history/?symbol=${symbol}&resolution=1D&to=${to}&from=${from}`
    );
  }
  static async getPairs(): Promise<[] | null> {
    return BonfidaApi.get(`pairs`);
  }
}
export const BONFIDA_DATA_FEED =
  (process.env.REACT_APP_CHART_API || "https://tradingview.compendex.xyz/") +
  "tv";
