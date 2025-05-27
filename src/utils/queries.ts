import axios from "axios";
import { GetNewListingsArgs, Token } from "../types";
import { COINMARKETCAP_API_KEY } from "./env.config";
import { formatUSDCompact } from "./helpers";

/**
 *
 * @param minLiquidity {number} minimum amount of liquidity
 */
export async function getNewListingsFromCoinmarketcap(
  args: GetNewListingsArgs
) {
  let msg = "";

  try {
    const latestListings = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
      {
        headers: {
          "X-CMC_PRO_API_KEY": COINMARKETCAP_API_KEY,
          Accept: "application/json",
          "Accept-Encoding": "deflate, gzip",
        },
      }
    );

    // Filter tokens with pools in specified dex platforms and liquidity greater than minLiquidity
    let filteredTokens = latestListings?.data?.data.filter((token: Token) => {
      const platformName = token.platform?.name;
      const volume24h = token.quote?.USD?.volume_24h;

      if (
        platformName?.toLowerCase() === args.network &&
        volume24h >= args.minLiquidity
      ) {
        return true;
      }

      return false;
    });

    const tokenIdArr = [];
    // Take first 10 tokens and fetch for more info if `args.take` is not provided
    const numberOfTokenToFetch = args.take || 10;
    const takeLimitedNumberOfToken = filteredTokens.slice(
      0,
      numberOfTokenToFetch
    );
    const tokenInfoRequest = takeLimitedNumberOfToken.map(async (token) => {
      tokenIdArr.push(token.id);

      return await axios.get(
        `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${token.id}`,
        {
          headers: {
            "X-CMC_PRO_API_KEY": COINMARKETCAP_API_KEY,
            Accept: "application/json",
            "Accept-Encoding": "deflate, gzip",
          },
        }
      );
    });

    const tokenInfoResponse = await axios.all(tokenInfoRequest);

    const result = tokenInfoResponse.map((resp: any, i) => {
      //
      let hasToken = resp.data.data[tokenIdArr[i]];
      let hasChatMedium = hasToken.urls && hasToken.urls.chat.length > 0;

      if (resp.data.status.error_code === 0 && hasChatMedium) {
        const {
          name,
          symbol,
          urls,
          contract_address,
          infinite_supply,
          platform,
        } = resp.data.data[tokenIdArr[i]];

        return {
          name,
          symbol,
          contract_address,
          infinite_supply,
          platform,
          urls,
        };
      }
    });

    result.forEach((token: any, i: number) => {
      if (token !== undefined) {
        const volume24hr = token.quote?.USD?.volume_24h;

        let sortedChat = token.urls?.chat.sort((a, b) => a - b);
        let discord,
          telegram = "";

        if (sortedChat.length > 1) {
          [discord, telegram] = sortedChat;
        } else if (sortedChat.length === 1 && sortedChat[0].match(/t.me/)) {
          telegram = sortedChat[0];
        } else if (sortedChat.length === 1 && sortedChat[0].match(/dis/)) {
          discord = sortedChat[0];
        }

        msg += `
                  Token Name: ${token.name || "NA"}
                  24hr Trade Volume: ${formatUSDCompact(parseInt(volume24hr))}
                  Website: ${token.urls?.website?.[0] || "NA"}
                  Twitter: ${token.urls?.twitter?.[0] || "NA"}
                  Telegram: ${telegram || "NA"}
                  Discord: ${discord || "NA"}
                  Facebook: ${token.urls?.facebook?.[0] || "NA"}
                  Reddit: ${token.urls?.reddit?.[0] || "NA"}
                  `;
      }
    });

    console.log(`Fetched and parsed token listings from Coinmarketcap`);

    return msg;
  } catch (err) {
    console.error(`getNewListings():`, err.message, err.stack);
    throw Error(err);
  }
}
