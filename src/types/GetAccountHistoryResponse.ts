import { JsonRpcResponse } from './JsonRpcBase'
import { OperationType } from './Operation'

interface GetAccountHistoryResult<T extends OperationType> {
  history: Array<AccountHistoryRecord<T>>
}

export interface AccountHistoryRecord<T extends OperationType>
  extends Array<number | AccountHistoryTransaction<T>> {
  0: number
  1: AccountHistoryTransaction<T>
}

export interface AccountHistoryTransaction<T extends OperationType> {
  block_num: string
  operation: T
  op_pos: number
  trx_id: string
  trx_in_block: number
  virtual_op: boolean
  timestamp: string
  operation_id?: number
}

export type GetAccountHistoryResponse<T extends OperationType> =
  JsonRpcResponse<GetAccountHistoryResult<T>>
