import { Transaction } from '@/types/Transaction'
import { HiveAsset, isHiveAsset } from './HiveAsset'

export const groupRewardsBetween = (
  operations: Transaction[],
  reconcileDays: boolean = false,
) => {
  const groupedOperations: Transaction[] = []
  // Sort by block_num
  const sortedOperations = operations.sort(
    (a, b) => Number(a.block_num) - Number(b.block_num),
  )

  const rewardOperations = [
    'curation_reward_operation',
    'comment_benefactor_reward_operation',
    'author_reward_operation',
    'claim_reward_balance_operation',
  ]

  // Sum up amount of all curation_reward_operation, comment_benefactor_reward_operation, author_reward_operation, claim_reward_balance_operation between other transactions
  let lastOperationHive: (Transaction & { amount: HiveAsset }) | undefined =
    undefined
  let lastOperationHbd: (Transaction & { amount: HiveAsset }) | undefined =
    undefined
  let lastOperationVests: (Transaction & { amount: HiveAsset }) | undefined =
    undefined

  for (let i = 0; i < sortedOperations.length; i++) {
    let operation = sortedOperations[i] as Transaction & { amount: HiveAsset }

    if (!isHiveAsset(operation.amount)) {
      operation = {
        ...operation,
        amount: new HiveAsset(operation.amount),
      }
    }

    if (isHiveAsset(operation.amount) && operation.amount.symbol === 'HIVE') {
      if (
        !rewardOperations.includes(operation.type) ||
        (reconcileDays &&
          lastOperationHive &&
          lastOperationHive.timestamp
            .endOf('day')
            .isBefore(operation.timestamp.startOf('day')))
      ) {
        if (lastOperationHive) {
          console.log('pushing hive operation', lastOperationHive)
          groupedOperations.push({
            ...lastOperationHive,
            timestamp: lastOperationHive.timestamp.endOf('day'),
          })
          lastOperationHive = undefined
        }

        groupedOperations.push(operation)
        continue
      }

      if (
        lastOperationHive &&
        lastOperationHive.type !== operation.type &&
        lastOperationHive.from !== operation.from &&
        lastOperationHive.to !== operation.to
      ) {
        console.log('pushing hive operation', lastOperationHive)
        groupedOperations.push({
          ...lastOperationHive,
          timestamp: lastOperationHive.timestamp.endOf('day'),
        })
        lastOperationHive = undefined
      }

      if (!lastOperationHive) {
        lastOperationHive = operation
      } else {
        lastOperationHive = {
          ...operation,
          amount: lastOperationHive.amount.plus(operation.amount),
        }
      }
    } else if (
      isHiveAsset(operation.amount) &&
      operation.amount.symbol === 'HBD'
    ) {
      if (
        !rewardOperations.includes(operation.type) ||
        (reconcileDays &&
          lastOperationHbd &&
          lastOperationHbd.timestamp
            .endOf('day')
            .isBefore(operation.timestamp.startOf('day')))
      ) {
        if (lastOperationHbd) {
          console.log('pushing hbd operation', lastOperationHbd)
          groupedOperations.push({
            ...lastOperationHbd,
            timestamp: lastOperationHbd.timestamp.endOf('day'),
          })
          lastOperationHbd = undefined
        }

        groupedOperations.push(operation)
        continue
      }

      if (
        lastOperationHbd &&
        lastOperationHbd.type !== operation.type &&
        lastOperationHbd.from !== operation.from &&
        lastOperationHbd.to !== operation.to
      ) {
        console.log('pushing hbd operation', lastOperationHbd)
        groupedOperations.push({
          ...lastOperationHbd,
          timestamp: lastOperationHbd.timestamp.endOf('day'),
        })
        lastOperationHbd = undefined
      }

      if (!lastOperationHbd) {
        lastOperationHbd = operation
      } else {
        lastOperationHbd = {
          ...operation,
          amount: lastOperationHbd.amount.plus(operation.amount),
        }
      }
    } else if (
      isHiveAsset(operation.amount) &&
      operation.amount.symbol === 'VESTS'
    ) {
      if (
        !rewardOperations.includes(operation.type) ||
        (reconcileDays &&
          lastOperationVests &&
          lastOperationVests.timestamp
            .endOf('day')
            .isBefore(operation.timestamp.startOf('day')))
      ) {
        if (lastOperationVests) {
          console.log('pushing vests operation', lastOperationVests)
          groupedOperations.push({
            ...lastOperationVests,
            timestamp: lastOperationVests.timestamp.endOf('day'),
          })
          lastOperationVests = undefined
        }

        groupedOperations.push(operation)
        continue
      }

      if (
        lastOperationVests &&
        lastOperationVests.type !== operation.type &&
        lastOperationVests.from !== operation.from &&
        lastOperationVests.to !== operation.to
      ) {
        console.log('pushing vests operation', lastOperationVests)
        groupedOperations.push({
          ...lastOperationVests,
          timestamp: lastOperationVests.timestamp.endOf('day'),
        })
        lastOperationVests = undefined
      }

      if (!lastOperationVests) {
        lastOperationVests = operation
      } else {
        lastOperationVests = {
          ...operation,
          amount: lastOperationVests.amount.plus(operation.amount),
        }
      }
    }

    if (i === sortedOperations.length - 1) {
      if (lastOperationHive) {
        groupedOperations.push(lastOperationHive)
      }

      if (lastOperationHbd) {
        groupedOperations.push(lastOperationHbd)
      }

      if (lastOperationVests) {
        groupedOperations.push(lastOperationVests)
      }
    }
  }

  return groupedOperations
}
