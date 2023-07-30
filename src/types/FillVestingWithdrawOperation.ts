import type { Operation } from '@hiveio/dhive'

interface FillVestingWithdrawOperation extends Operation {
  0: 'fill_vesting_withdraw'
  1: {
    deposited: string
    from_account: string
    to_account: string
    withdrawn: string
  }
}

export default FillVestingWithdrawOperation
