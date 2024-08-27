import { OperationType } from '@/types/Operation'
import { HiveAsset } from './HiveAsset'
import { AccountHistoryTransaction } from '@/types/GetAccountHistoryResponse'

export class HiveAccountTransaction<T extends OperationType> {
  transaction: AccountHistoryTransaction<T>

  constructor(transaction: AccountHistoryTransaction<T>) {
    this.transaction = transaction

    switch (this.operation.type) {
      case 'collateralized_convert_immediate_conversion_operation': {
        const hbdOut = this.operation.value.hbd_out

        this.operationValue = {
          ...this.operationValue,
          hbd_out: new HiveAsset(hbdOut),
        }

        break
      }

      case 'interest_operation': {
        const interest = this.operation.value.interest

        this.operationValue = {
          ...this.operationValue,
          interest: new HiveAsset(interest),
        }

        break
      }

      case 'curation_reward_operation': {
        const reward = this.operation.value.reward

        this.operationValue = {
          ...this.operationValue,
          reward: new HiveAsset(reward),
        }

        break
      }

      case 'comment_benefactor_reward_operation':
      case 'author_reward_operation': {
        const rewardHive = this.operation.value.hive_payout
        const rewardHbd = this.operation.value.hbd_payout
        const rewardVests = this.operation.value.vesting_payout

        this.operationValue = {
          ...this.operationValue,
          hive_payout: new HiveAsset(rewardHive),
          hbd_payout: new HiveAsset(rewardHbd),
          vesting_payout: new HiveAsset(rewardVests),
        }

        break
      }

      case 'collateralized_convert_operation':
      case 'convert_operation':
      case 'fill_transfer_from_savings_operation':
      case 'transfer_to_savings_operation':
      case 'transfer_from_savings_operation':
      case 'fill_recurrent_transfer_operation':
      case 'transfer_operation': {
        const amount = this.operation.value.amount

        this.operationValue = {
          ...this.operationValue,
          amount: new HiveAsset(amount),
        }

        break
      }

      case 'transfer_to_vesting_completed_operation': {
        const hiveVested = this.operation.value.hive_vested
        const vestingSharesReceived =
          this.operation.value.vesting_shares_received

        this.operationValue = {
          ...this.operationValue,
          hive_vested: new HiveAsset(hiveVested),
          vesting_shares_received: new HiveAsset(vestingSharesReceived),
        }

        break
      }

      case 'claim_account_operation':
      case 'account_create_operation': {
        const fee = this.operation.value.fee

        this.operationValue = {
          ...this.operationValue,
          fee: new HiveAsset(fee),
        }

        break
      }

      case 'claim_reward_balance_operation': {
        const rewardHive = this.operation.value.reward_hive
        const rewardHbd = this.operation.value.reward_hbd
        const rewardVests = this.operation.value.reward_vests

        this.operationValue = {
          ...this.operationValue,
          reward_hive: new HiveAsset(rewardHive),
          reward_hbd: new HiveAsset(rewardHbd),
          reward_vests: new HiveAsset(rewardVests),
        }

        break
      }

      case 'fill_vesting_withdraw_operation': {
        const withdrawn = this.operation.value.withdrawn
        const deposited = this.operation.value.deposited

        this.operationValue = {
          ...this.operationValue,
          withdrawn: new HiveAsset(withdrawn),
          deposited: new HiveAsset(deposited),
        }

        break
      }

      case 'fill_order_operation': {
        const currentPays = this.operation.value.current_pays
        const openPays = this.operation.value.open_pays

        this.operationValue = {
          ...this.operationValue,
          current_pays: new HiveAsset(currentPays),
          open_pays: new HiveAsset(openPays),
        }

        break
      }

      case 'fill_collateralized_convert_request_operation':
      case 'fill_convert_request_operation': {
        const amountIn = this.operation.value.amount_in
        const amountOut = this.operation.value.amount_out

        this.operationValue = {
          ...this.operationValue,
          amount_in: new HiveAsset(amountIn),
          amount_out: new HiveAsset(amountOut),
          excess_collateral:
            this.operation.type ===
            'fill_collateralized_convert_request_operation'
              ? new HiveAsset(this.operation.value.excess_collateral)
              : undefined,
        }

        break
      }

      default:
        break
    }
  }

  get block(): string {
    return this.transaction.block_num
  }

  get operation() {
    return this.transaction.operation
  }

  set operation(operation) {
    this.transaction = {
      ...this.transaction,
      operation: {
        ...this.operation,
        ...operation,
      },
    }
  }

  get operationType() {
    return this.operation.type
  }

  get operationValue() {
    return this.operation.value
  }

  set operationValue(operationValue) {
    this.transaction = {
      ...this.transaction,
      operation: {
        ...this.operation,
        value: operationValue,
      },
    }
  }

  get opId() {
    return this.transaction.operation_id || 0
  }

  get opInTrx() {
    return this.transaction.op_pos
  }

  get trxId() {
    return this.transaction.trx_id
  }

  get trxInBlock() {
    return this.transaction.trx_in_block
  }

  get timestamp() {
    return this.transaction.timestamp
  }

  get isVirtualOp() {
    return this.transaction.virtual_op
  }
}
