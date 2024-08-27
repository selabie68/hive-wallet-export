import dayjs from 'dayjs'

import { TransferOperation } from '@/types/Operation'
import { Transaction } from '@/types/Transaction'
import { HiveAccountTransaction } from '../../HiveAccountTransaction'

export const transferOperationHandler = (
  transaction: HiveAccountTransaction<TransferOperation>,
): Transaction[] => {
  const block_num = transaction.block
  const operation = transaction.operation
  const timestamp = dayjs(transaction.timestamp)
  const id = `${transaction.block}_${transaction.trxId}_${transaction.trxInBlock}_${transaction.opInTrx}_${transaction.opId}`

  const amount = operation.value.amount
  const to = operation.value.to
  const from = operation.value.from

  // make the memo safe for CSV
  const memo = operation.value.memo
    ? (operation.value.memo as string)
        .replace(/"/g, '""')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/,/g, ' ')
        .replace(/;/g, ' ')
    : ''

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
      from,
      to,
      memo,
      amount,
      type: operation.type,
    },
  ]
}
