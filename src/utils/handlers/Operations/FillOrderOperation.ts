import dayjs from 'dayjs'

import { FillOrderOperation } from '@/types/Operation'
import { Transaction } from '@/types/Transaction'
import { HiveAccountTransaction } from '@/utils/HiveAccountTransaction'

export const fillOrderOperationHandler = (
  transaction: HiveAccountTransaction<FillOrderOperation>,
): Transaction[] => {
  const ops: Transaction[] = []
  const blockNumber = transaction.block
  const operation = transaction.operation
  const timestamp = dayjs(transaction.timestamp)
  const txHash = `${transaction.block}_${transaction.trxId}_${transaction.trxInBlock}_${transaction.opInTrx}_${transaction.opId}`

  const currentOwner = operation.value.current_owner
  const currentPays = operation.value.current_pays

  const openOwner = operation.value.open_owner
  const openPays = operation.value.open_pays

  ops.push({
    id: txHash,
    block_num: blockNumber,
    timestamp,
    trx_id: transaction.trxId,
    trx_in_block: transaction.trxInBlock,
    op_pos: transaction.opInTrx,
    operation_id: transaction.opId,
    type: operation.type,
    from: currentOwner,
    to: openOwner,
    amount: currentPays,
    memo: '',
    virtual_op: transaction.isVirtualOp,
  })

  ops.push({
    id: txHash,
    block_num: blockNumber,
    timestamp,
    trx_id: transaction.trxId,
    trx_in_block: transaction.trxInBlock,
    op_pos: transaction.opInTrx,
    operation_id: transaction.opId,
    type: operation.type,
    from: openOwner,
    to: currentOwner,
    amount: openPays,
    memo: '',
    virtual_op: transaction.isVirtualOp,
  })

  return ops
}
