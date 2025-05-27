import { axiosInstance } from "./axiosInstance";

// TODO:
// 1. Filter uniswap v3 Pool by social media handle
// 2. Get poolCreate from bitquery and use the result (token) contract address
// 3. To sort the coinmarket cap token metadata

const uniswapFactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

interface BitQueryArgs {
  limit: number;
  contractAddress: string;
}
export async function bitQuery({ limit, contractAddress }: BitQueryArgs) {
  var data = JSON.stringify({
    query:
      'query Query($network: evm_network!, $contract_address: String!, $limit: Int!) {\n  EVM(dataset: combined, network: $network) {\n    Events(\n      orderBy: {descending: Block_Number}\n      limit: {count: $limit}\n      where: {Log: {SmartContract: {is: $contract_address}, Signature: {Name: {is: "PoolCreated"}}}}\n    ) {\n      Log {\n        Signature {\n          Name\n          Parsed\n          Signature\n        }\n        SmartContract\n      }\n      Transaction {\n        Hash\n        To\n        From\n      }\n    }\n  }\n}\n',
    variables:
      '{\n  "network": "eth",\n  "limit": 2,\n  "contract_address": "0x1f98431c8ad98523631ae4a59f267346ea31f984"\n}',
  });

  // get data
  const res = await query_api({
    data,
    method: "post",
  });

  res.data.data?.EVM.Events.map((itm) => {
    console.log(itm);
  });
}

interface Query {
  method: "get" | "post";
  data: any;
}
/**
 * @dev Function to query bitquery endpoint
 */

 async function query_api({ method, data }: Query) {
  try {
    return await axiosInstance({
      method,
      data,
    });
  } catch (err) {
    throw Error(err);
  }
}
