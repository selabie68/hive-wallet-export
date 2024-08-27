import type { Dayjs } from 'dayjs'
import type { Big } from 'big.js'

import { HiveAssetObject } from '@/utils/HiveAsset'

interface GenericLine {
  id: string
  trx: string
  block: string
  timestamp: string | Dayjs
  type: string
  from: string
  to: string
  amount: string | HiveAsset | HiveAssetObject
  memo: string
  debit: Big
  credit: Big
}
