import dayjs from 'dayjs'

import { CurationRewardOperation } from '@/types/Operation'
import { Transaction } from '@/types/Transaction'
import { HiveAccountTransaction } from '@/utils/HiveAccountTransaction'

export const curationRewardOperationHandler = (
  transaction: HiveAccountTransaction<CurationRewardOperation>,
): Transaction[] => {
  const ops: Transaction[] = []
  const blockNumber = transaction.block
  const operation = transaction.operation
  const timestamp = dayjs(transaction.timestamp)
  const txHash = `${transaction.block}_${transaction.trxId}_${transaction.trxInBlock}_${transaction.opInTrx}_${transaction.opId}`

  const owner = operation.value.curator
  const amountOut = operation.value.reward

  if (operation.value.payout_must_be_claimed) {
    return ops
  }

  ops.push({
    id: txHash,
    block_num: blockNumber,
    timestamp,
    trx_id: transaction.trxId,
    trx_in_block: transaction.trxInBlock,
    op_pos: transaction.opInTrx,
    operation_id: transaction.opId,
    type: operation.type,
    from: 'null',
    to: owner,
    amount: amountOut,
    memo: '',
    virtual_op: transaction.isVirtualOp,
  })

  return ops
}
