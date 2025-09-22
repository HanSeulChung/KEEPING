import api from './axios'
import { endpoints, fill } from './config'

export interface WalletBalance {
  storeId: number
  storeName: string
  balance: number
}
export interface Tx {
  id: number
  type: 'CHARGE' | 'USAGE'
  amount: number
  date: string
  by: string
}

export const WalletApi = {
  balances: (groupId: number) =>
    api
      .get<WalletBalance[]>(fill(endpoints.wallet.groupBalances, { groupId }))
      .then(r => r.data),
  transactions: (groupId: number, page = 1, size = 10) =>
    api
      .get<
        Tx[]
      >(fill(endpoints.wallet.groupTransactions, { groupId }), { params: { page, size } })
      .then(r => r.data),
  share: (groupId: number, amount: number) =>
    api
      .post<void>(fill(endpoints.wallet.share, { groupId }), { amount })
      .then(r => r.data),
  withdraw: (groupId: number, amount: number) =>
    api
      .post<void>(fill(endpoints.wallet.withdraw, { groupId }), { amount })
      .then(r => r.data),
}
