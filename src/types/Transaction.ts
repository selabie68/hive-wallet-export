import dayjs from 'dayjs'

import { HiveAsset, HiveAssetObject } from '@/utils/HiveAsset'
import { OperationTypeString } from './Operation'

export interface Transaction {
  id: string
  trx_id: string
  block_num: string
  trx_in_block: number
  op_pos: number
  timestamp: dayjs.Dayjs
  operation_id: number
  virtual_op: boolean
  from: string
  to: string
  memo?: string
  type: OperationTypeString
  amount: string | HiveAsset | HiveAssetObject
}
