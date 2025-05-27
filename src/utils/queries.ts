import axios from "axios";
import { MinLiquidity, Token } from "../types";
import { COINMARKETCAP_API_KEY } from "./env.config";
import { sendTelegramMessage } from "./telegram/tg.bot";

enum Network {
  eth = "ethereum",
}

/**
 *
 * @param minLiquidity {number} minimum amount of liquidity
 */
async function getNewListingsFromCoinmarketcap({ minLiquidity }: MinLiquidity) {
  let msg = "";

  try {
    const latestListings = await axios.get(
      process.env.COINMARKETCAP_LASTEST_LISTINGS_URL,
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_APIKEY,
          Accept: "application/json",
          "Accept-Encoding": "deflate, gzip",
        },
      }
    );

    // Filter tokens with pools in specified dex platforms and liquidity greater than minLiquidity
    let filteredTokens = latestListings?.data?.data.filter((token: Token) => {
      if (
        token.platform &&
        token.platform["name"].toLowerCase() == "ethereum" &&
        token.quote.USD.volume_24h > minLiquidity
      ) {
        return token;
      }
    });

    const tokenIdArr = [];
    const tokenInfoRequest = filteredTokens.slice(0, 10).map(async (token) => {
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
      // check for token platform
      const hasContractAddress = token?.contract_address[i];
      if (
        hasContractAddress &&
        hasContractAddress["platform"]["name"].toLowerCase() === Network.eth
      ) {
        console.log("yes");

        // console.log(hasContractAddress['name'].toLowerCase() === Network.eth);
      }
      if (token !== undefined) {
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
    console.log(msg);

    return msg;
  } catch (err) {
    console.error(`getNewListings():`, err.message);
    throw Error(err);
  }
}

export async function getNewListingsAndPushToTelegram(liquidity = 10_000_000) {
  const msg = await getNewListingsFromCoinmarketcap({
    minLiquidity: liquidity,
  });

  await sendTelegramMessage(msg);
}
