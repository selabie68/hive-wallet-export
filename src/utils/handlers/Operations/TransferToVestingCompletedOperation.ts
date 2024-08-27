import dayjs from 'dayjs'

import { TransferToVestingCompletedOperation } from '@/types/Operation'
import { Transaction } from '@/types/Transaction'
import { HiveAccountTransaction } from '@/utils/HiveAccountTransaction'

export const transferToVestingCompletedOperationHandler = (
  transaction: HiveAccountTransaction<TransferToVestingCompletedOperation>,
  username: string,
): Transaction[] => {
  const ops: Transaction[] = []
  const blockNumber = transaction.block
  const operation = transaction.operation
  const timestamp = dayjs(transaction.timestamp)
  const txHash = `${transaction.block}_${transaction.trxId}_${transaction.trxInBlock}_${transaction.opInTrx}_${transaction.opId}`

  const depositedAsset = operation.value.hive_vested
  const receivedAsset = operation.value.vesting_shares_received

  const to = operation.value.to_account
  const from = operation.value.from_account

  if (from === username) {
    ops.push({
      id: txHash,
      block_num: blockNumber,
      timestamp,
      trx_id: transaction.trxId,
      trx_in_block: transaction.trxInBlock,
      op_pos: transaction.opInTrx,
      operation_id: transaction.opId,
      type: operation.type,
      from,
      to: to === username ? 'null' : to,
      amount: depositedAsset,
      memo: '',
      virtual_op: transaction.isVirtualOp,
    })
  }

  if (to === username) {
    ops.push({
      id: txHash,
      block_num: blockNumber,
      timestamp,
      trx_id: transaction.trxId,
      trx_in_block: transaction.trxInBlock,
      op_pos: transaction.opInTrx,
      operation_id: transaction.opId,
      type: operation.type,
      from: from === username ? 'null' : from,
      to,
      amount: receivedAsset,
      memo: '',
      virtual_op: transaction.isVirtualOp,
    })
  }

  return ops
}
