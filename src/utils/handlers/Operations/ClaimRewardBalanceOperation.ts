import dayjs from 'dayjs'

import { ClaimRewardBalanceOperation } from '@/types/Operation'
import { Transaction } from '@/types/Transaction'
import { HiveAccountTransaction } from '@/utils/HiveAccountTransaction'
import { HiveAsset, isHiveAsset } from '@/utils/HiveAsset'

export const claimRewardBalanceOperationHandler = (
  transaction: HiveAccountTransaction<ClaimRewardBalanceOperation>,
  username: string,
): Transaction[] => {
  const ops: Transaction[] = []
  const blockNumber = transaction.block
  const operation = transaction.operation
  const timestamp = dayjs(transaction.timestamp)
  const txHash = `${transaction.block}_${transaction.trxId}_${transaction.trxInBlock}_${transaction.opInTrx}_${transaction.opId}`

  const rewardHive = isHiveAsset(operation.value.reward_hive)
    ? operation.value.reward_hive
    : new HiveAsset(operation.value.reward_hive)
  const rewardHbd = isHiveAsset(operation.value.reward_hbd)
    ? operation.value.reward_hbd
    : new HiveAsset(operation.value.reward_hbd)
  const rewardVests = isHiveAsset(operation.value.reward_vests)
    ? operation.value.reward_vests
    : new HiveAsset(operation.value.reward_vests)

  if (rewardHive.toNumber() > 0) {
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
      to: username,
      amount: rewardHive,
      memo: '',
      virtual_op: transaction.isVirtualOp,
    })
  }

  if (rewardHbd.toNumber() > 0) {
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
      to: username,
      amount: rewardHbd,
      memo: '',
      virtual_op: transaction.isVirtualOp,
    })
  }

  if (rewardVests.toNumber() > 0) {
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
      to: username,
      amount: rewardVests,
      memo: '',
      virtual_op: transaction.isVirtualOp,
    })
  }

  return ops
}
