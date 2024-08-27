import dayjs from 'dayjs'

import { InterestOperation } from '@/types/Operation'
import { Transaction } from '@/types/Transaction'
import { HiveAccountTransaction } from '../../HiveAccountTransaction'

export const interestOperationHandler = (
  transaction: HiveAccountTransaction<InterestOperation>,
): Transaction[] => {
  const block_num = transaction.block
  const operation = transaction.operation
  const timestamp = dayjs(transaction.timestamp)
  const id = `${transaction.block}_${transaction.trxId}_${transaction.trxInBlock}_${transaction.opInTrx}_${transaction.opId}`

  const owner = operation.value.owner
  const amount = operation.value.interest

  return [
    {
      id,
      block_num,
      timestamp,
      trx_id: transaction.trxId,
      trx_in_block: transaction.trxInBlock,
      op_pos: transaction.opInTrx,
      operation_id: transaction.opId,
      virtual_op: transaction.isVirtualOp,
      from: 'null',
      to: owner,
      memo: '',
      amount,
      type: operation.type,
    },
  ]

  return []
}
