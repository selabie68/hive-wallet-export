import type { Operation } from '@hiveio/dhive'

interface FillOrderOperation extends Operation {
  0: 'fill_vesting_withdraw'
  1: {
    current_orderid: number
    current_owner: string
    current_pays: string
    open_orderid: number
    open_owner: string
    open_pays: string
  }
}

export default FillOrderOperation
