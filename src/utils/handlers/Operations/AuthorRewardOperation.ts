import dayjs from 'dayjs'

import {
  AuthorRewardOperation,
  CommentBenefactorRewardOperation,
} from '@/types/Operation'
import { Transaction } from '@/types/Transaction'
import { HiveAccountTransaction } from '@/utils/HiveAccountTransaction'

export const authorRewardOperationHandler = (
  transaction: HiveAccountTransaction<
    AuthorRewardOperation | CommentBenefactorRewardOperation
  >,
): Transaction[] => {
  const ops: Transaction[] = []
  const blockNumber = transaction.block
  const operation = transaction.operation
  const timestamp = dayjs(transaction.timestamp)
  const txHash = `${transaction.block}_virtual_op_${transaction.opInTrx}_${transaction.opId}`

  const rewardHive = operation.value.hive_payout
  const rewardHbd = operation.value.hbd_payout
  const rewardVests = operation.value.vesting_payout

  const to =
    operation.type === 'author_reward_operation'
      ? operation.value.author
      : operation.value.benefactor

  if (operation.value.payout_must_be_claimed) {
    return ops
  }

  if (rewardHive.toNumber() > 0) {
    ops.push({
      id: `${txHash}_HIVE`,
      block_num: blockNumber,
      timestamp,
      trx_id: transaction.trxId,
      trx_in_block: transaction.trxInBlock,
      op_pos: transaction.opInTrx,
      operation_id: transaction.opId,
      type: operation.type,
      from: 'null',
      to,
      amount: rewardHive,
      memo: '',
      virtual_op: transaction.isVirtualOp,
    })
  }

  if (rewardHbd.toNumber() > 0) {
    ops.push({
      id: `${txHash}_HBD`,
      block_num: blockNumber,
      timestamp,
      trx_id: transaction.trxId,
      trx_in_block: transaction.trxInBlock,
      op_pos: transaction.opInTrx,
      operation_id: transaction.opId,
      type: operation.type,
      from: 'null',
      to,
      amount: rewardHbd,
      memo: '',
      virtual_op: transaction.isVirtualOp,
    })
  }

  if (rewardVests.toNumber() > 0) {
    ops.push({
      id: `${txHash}_VESTS`,
      block_num: blockNumber,
      timestamp,
      trx_id: transaction.trxId,
      trx_in_block: transaction.trxInBlock,
      op_pos: transaction.opInTrx,
      operation_id: transaction.opId,
      type: operation.type,
      from: 'null',
      to,
      amount: rewardVests,
      memo: '',
      virtual_op: transaction.isVirtualOp,
    })
  }

  return ops
}
