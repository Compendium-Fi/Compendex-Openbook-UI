# Compendex-Openbook-UI

This is an open source implementation of the new Openbook protocol for Solana (forked from Project Serum) provided by the [Compendium](https://docs.compendium.finance) team. The purpose of this repository is to provide a new stepping stone for the greater community to further build new tools and expand on. A version of this interface is publicly available for use and integrated into our [Compendex](https://sol.compendex.xyz) platform. Pull requests and Issue submissions are welcome and will be reviewed.

![image](https://user-images.githubusercontent.com/36686278/227060628-ee55ab72-513d-40af-84d6-dc755e839659.png)

## What is Openbook?

OpenBook is a cutting-edge decentralized exchange (DEX) built on Solana, a high-performance blockchain network. Leveraging the Continuous Limit Order Book (CLOB) model, OpenBook offers a seamless trading experience to its users. In this segment, we will delve into the technicalities of a DEX and elucidate how users interact with the platform through various order types.

At its core, the trade lifecycle on OpenBook can be broadly classified into four stages. Firstly, users transfer their funds from their SPL token account, i.e., their digital wallet, to an intermediary account termed "Open Orders" account. Next, they initiate an order placement request that gets added to the Request Queue. Subsequently, the request is extracted from the Request Queue, it is matched with other orders. Upon successful matching, the trade is executed, and the trade details are added to the Orderbook. The entire process is seamlessly reported in the Event Queue.

In the next stage, users can consume the trade events from the Event Queue and have their Open Orders account balances updated. Finally, the trade settlement stage enables users to retrieve any residual funds from their Open Orders account back to their SPL token account. OpenBook's superior technology ensures that the trade settlement is quick and hassle-free, ensuring users can focus on their trading strategies as they would with a traditional centralized exchange.

OpenBook's implementation of the CLOB model ensures efficient price discovery, higher liquidity, and reduced slippage, making it a highly sought-after DEX model. The platform's intuitive user interface, lightning-fast trade execution, and robust security features make it an excellent choice for both novice and seasoned traders alike.

Further Documentation for usage of the Openbook interface from a user perspective can be found [here](https://docs.compendium.finance/decentralized-trading-tools/solana-integrations/openbook-spot-markets).

#### Protocol Management Legal Notice
Compendium & Compendex do not manage the OpenBook protocol nor are directly associated with any smart contract deployments. This interface example simply provides a way to access and initiate on-chain events.

## How to run the project

1. Clone the repository
2. Navigate to the source directory
3. Run `npm ci` or `yarn` to install dependencies
4. Copy TradingView chart library folders (charting_library,datafeed) into public/static folder
5. Create an `.env.local` file in the project directory following this example:
- NEXT_PUBLIC_SOLANA_RPC_ENDPOINT="place your solana rpc here "
- NEXT_PUBLIC_USDT_REFERRAL="place your USDT referral address here"
- NEXT_PUBLIC_USDC_REFERRAL="place your USDC referral address here"
- NEXT_PUBLIC_DATA_FEED_ENDPOINT="place your data feed for trading view here"
6. Run `npm run dev` or `yarn dev` to start the development server.

Note: You will need to have Node.js and npm or yarn installed on your machine to run this project.

## Collecting Referral Fees

If you are hosting a public UI using this codebase, you can collect referral fees when your users trade through your site.

To do so, set the NEXT_PUBLIC_USDT_REFERRAL and NEXT_PUBLIC_USDC_REFERRAL environment variables to the addresses of your USDT and USDC SPL token accounts.

## TradingView Chart Data Insertion

Use in public deployment of an interface may require the deployer to digest on-chain data and reformat into a compatible OHLCV format in order to work with the TradingView integration.

![image](https://user-images.githubusercontent.com/36686278/227062566-81ab8804-c696-4b74-8310-03100869ec1b.png)

### Compendex TradingView WebSocket

If you are unable to retrieve and host your own TradingView data feeds we may be able to help. Reach out to our team via our official Discord server to initiate conversation.

### CoinGecko "Simple Charts" Fallback

The example user interface also includes the [CoinGecko API](https://www.coingecko.com/en/api) to provide a backup pricing chart for every supported market. Users can select the "Simple Chart" option to display a line area graph. The deployer can easily make this the default if they wish to substitute it for TradingView. The deployer can also upgrade the CoinGecko API from the free version to a PRO version in order to handle more frequent calls and traffic if needed.

![image](https://user-images.githubusercontent.com/36686278/227062603-fce438ad-d57b-42b9-96c5-f595bec787e0.png)

## Official Links & Support

For further support, please join our [Discord server](https://discord.gg/compendium-pendax-846967032288509953) or email us at support@compendium.finance.

- Compendex Twitter: https://twitter.com/compendexyz
- Compendium Twitter: https://twitter.com/CompendiumFi
