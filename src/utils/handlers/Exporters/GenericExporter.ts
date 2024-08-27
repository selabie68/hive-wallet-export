import { Transaction } from '@/types/Transaction'
import { HiveAsset, isHiveAsset } from '@/utils/HiveAsset'

export const genericExporterHandler = (
  transaction: Transaction,
  username: string,
): any[] | undefined => {
  if (transaction.to !== transaction.from) {
    const amount = isHiveAsset(transaction.amount)
      ? transaction.amount
      : typeof transaction.amount === 'string' ||
          (typeof transaction.amount.amount === 'string' &&
            (transaction.amount.amount.includes(' HIVE') ||
              transaction.amount.amount.includes(' HBD') ||
              transaction.amount.amount.includes(' VESTS')))
        ? new HiveAsset(transaction.amount)
        : new HiveAsset('0 HIVE')

    return [
      transaction.id || '', // id
      transaction.trx_id || '', // trx
      transaction.block_num || '', // block
      transaction.timestamp.format('YYYY-MM-DD HH:mm:ss'), // Timestamp (UTC)
      transaction.type || '', // Type
      transaction.from || '', // From
      transaction.to || '', // To
      transaction.amount || '', // Amount
      transaction.memo || '', // Memo
      transaction.to === username
        ? new HiveAsset('0 VESTS')
        : amount || new HiveAsset('0 VESTS'), // Debit
      transaction.to === username
        ? amount || new HiveAsset('0 VESTS')
        : new HiveAsset(`0 ${amount.symbol}`), // Credit
    ]
  }
}
