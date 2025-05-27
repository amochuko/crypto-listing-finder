import axios from 'axios';

declare module 'axios' {
  export interface AxiosResponse<T = any> extends Promise<T> {}
}

const instance = axios.create({
  timeout:1500,
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': process.env.BITQUERY_API,
  },
  baseURL: 'https://streaming.bitquery.io/graphql',
});

export  {instance as axiosInstance};
