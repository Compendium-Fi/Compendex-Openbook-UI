import { BonfidaTrade } from "./types";

//const baseUrl = "https://event-history-api-candles.herokuapp.com";
//const baseUrl = "https://dry-ravine-67635.herokuapp.com";
// const baseUrl = 'http://localhost:4000'
const baseUrl = "https://tradingview.compendex.xyz";

export default class ChartApi {
  static URL = `${baseUrl}/`;

  static async get(path: string) {
    try {
      const response = await fetch(this.URL + path);
      if (response.ok) {
        const responseJson = await response.json();
        return responseJson.success
          ? responseJson.data
          : responseJson
          ? responseJson
          : null;
      }
    } catch (err) {
      console.log(`Error fetching from Chart API ${path}: ${err}`);
    }
    return null;
  }

  static async getRecentTrades(
    marketAddress: string
  ): Promise<BonfidaTrade[] | null> {
    if (!marketAddress) return null;
    return ChartApi.get(`trades/address/${marketAddress}`);
  }

  static async getOhlcv(
    symbol: string,
    resolution: string,
    from: number,
    to: number
  ): Promise<BonfidaTrade[] | null> {
    if (!symbol) return null;
    return ChartApi.get(
      `tv/history?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`
    );
  }
}

export const CHART_DATA_FEED = `${baseUrl}/tv`;
