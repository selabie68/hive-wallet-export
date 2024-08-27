import { JsonRpcRequest } from './JsonRpcBase'

export interface GetAccountHistoryParams {
  account: string
  start: string | -1
  limit: number
  include_reversible: boolean
  operation_filter_low: number
  operation_filter_high: number
}

export interface GetAccountHistoryBatchParams extends GetAccountHistoryParams {
  batch: number
}

export type GetAccountHistoryPayload = JsonRpcRequest<
  'account_history_api.get_account_history',
  GetAccountHistoryParams
>
