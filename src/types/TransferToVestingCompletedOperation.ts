import type { Operation } from '@hiveio/dhive'

interface TransferToVestingCompletedOperation extends Operation {
  0: 'transfer_to_vesting_completed'
  1: {
    from_account: string
    hive_vested: string
    to_account: string
    vesting_shares_received: string
  }
}

export default TransferToVestingCompletedOperation
