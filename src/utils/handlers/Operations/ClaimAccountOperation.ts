import dayjs from 'dayjs'

import { ClaimAccountOperation } from '@/types/Operation'
import { Transaction } from '@/types/Transaction'
import { HiveAccountTransaction } from '@/utils/HiveAccountTransaction'

export const claimAccountOperationHandler = (
  transaction: HiveAccountTransaction<ClaimAccountOperation>,
  username: string,
): Transaction[] => {
  const ops: Transaction[] = []
  const blockNumber = transaction.block
  const operation = transaction.operation
  const timestamp = dayjs(transaction.timestamp)
  const txHash = `${transaction.block}_${transaction.trxId}_${transaction.trxInBlock}_${transaction.opInTrx}_${transaction.opId}`

  const creator = operation.value.creator
  const created = creator === username
  const amount = operation.value.fee

  if (created) {
    ops.push({
      id: txHash,
      block_num: blockNumber,
      timestamp,
      trx_id: transaction.trxId,
      trx_in_block: transaction.trxInBlock,
      op_pos: transaction.opInTrx,
      operation_id: transaction.opId,
      type: operation.type,
      from: username,
      to: 'null',
      amount,
      memo: '',
      virtual_op: transaction.isVirtualOp,
    })
  }

  return ops
}
