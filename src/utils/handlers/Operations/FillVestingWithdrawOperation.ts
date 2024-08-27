import dayjs from 'dayjs'

import { FillVestingWithdrawOperation } from '@/types/Operation'
import { Transaction } from '@/types/Transaction'
import { HiveAccountTransaction } from '@/utils/HiveAccountTransaction'

export const fillVestingWithdrawOperationHandler = (
  transaction: HiveAccountTransaction<FillVestingWithdrawOperation>,
  username: string,
): Transaction[] => {
  const ops: Transaction[] = []
  const blockNumber = transaction.block
  const operation = transaction.operation
  const timestamp = dayjs(transaction.timestamp)
  const txHash = `${transaction.block}_${transaction.trxId}_${transaction.trxInBlock}_${transaction.opInTrx}_${transaction.opId}`

  const depositedAsset = operation.value.deposited
  const withdrawnAsset = operation.value.withdrawn

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
      amount: withdrawnAsset,
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
      from: from === username ? 'null' : username,
      to,
      amount: depositedAsset,
      memo: '',
      virtual_op: transaction.isVirtualOp,
    })
  }

  return ops
}
