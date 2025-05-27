export enum BlockchainNetwork {
  eth = "ethereum",
}

export interface GetNewListingsArgs {
  minLiquidity: number;
  network: BlockchainNetwork;
  take?: number;
}

export interface Token {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  num_market_pairs: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  infinite_supply: boolean;
  last_updated: string;
  date_added: string;
  tags: string[];
  platform: {
    name: string;
    token_address: string;
    slug: string;
    id: number | string;
    symbol: string;
  };
  self_reported_circulating_supply: number;
  self_reported_market_cap: number;
  quote: Record<string, { [index: string]: any }>;
}
