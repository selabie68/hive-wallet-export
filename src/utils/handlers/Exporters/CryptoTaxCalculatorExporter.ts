import { CryptoTaxCalculatorLine } from '@/types/CryptoTaxCalculator/Line'
import { Transaction } from '@/types/Transaction'
import { HiveAsset, isHiveAsset } from '@/utils/HiveAsset'
import { OperationTypeString } from '@/types/Operation'

export const cryptoTaxCalculatorExporterHandler = (
  transaction: Transaction,
  username: string,
): string[] | undefined => {
  if (transaction.to !== transaction.from) {
    const amount = isHiveAsset(transaction.amount)
      ? transaction.amount
      : typeof transaction.amount.amount === 'string' &&
          (transaction.amount.amount.includes(' HIVE') ||
            transaction.amount.amount.includes(' HBD') ||
            transaction.amount.amount.includes(' VESTS'))
        ? new HiveAsset(transaction.amount)
        : new HiveAsset('0 HIVE')

    return [
      transaction.timestamp.format('YYYY-MM-DD HH:mm:ss'), // Timestamp (UTC)
      convertHiveType(transaction.type, transaction.from, username) || '', // Type
      amount.symbol || '', // Base Currency
      amount.toFixed() || '', // Base Amount
      '', // Quote Currency
      '', // Quote Amount
      '', // Fee Currency
      '', // Fee Amount
      transaction.from || '', // From
      transaction.to || '', // To
      '', // Blockchain
      transaction.id || '', // ID
      `${transaction.type}: ${transaction.memo}` || transaction.type, // Description
      '', // Reference Price
      '', // Reference Price Currency
    ]
  }
}

const convertHiveType = (
  hiveType: OperationTypeString,
  from: string,
  username: string,
): CryptoTaxCalculatorLine['type'] => {
  switch (hiveType) {
    case 'claim_reward_balance_operation':
      return 'staking'

    case 'transfer_to_vesting_completed_operation':
      return 'staking-deposit'

    case 'fill_vesting_withdraw_operation':
      return 'staking-withdrawal'

    case 'fill_convert_request_operation':
    case 'fill_order_operation':
    case 'fill_collateralized_convert_request_operation':
    case 'convert_operation':
    case 'collateralized_convert_operation':
    case 'collateralized_convert_immediate_conversion_operation':
      return from === username ? 'sell' : 'buy'

    case 'account_create_operation':
    case 'claim_account_operation':
      return 'expense'

    case 'author_reward_operation':
    case 'interest_operation':
    case 'comment_benefactor_reward_operation':
    case 'curation_reward_operation':
      return 'income'

    case 'fill_recurrent_transfer_operation':
    case 'transfer_operation':
    default:
      return from === username ? 'send' : 'receive'
  }
}
