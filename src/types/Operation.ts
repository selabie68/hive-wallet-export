import { HiveAsset, HiveAssetObject } from '@/utils/HiveAsset'

export type OperationTypeString = keyof IOperation
export type OperationType = IOperation[keyof IOperation]

export interface Operation<T extends keyof IOperation> {
  type: T
  value: IOperation[T]
}

export interface IOperation {
  claim_reward_balance_operation: ClaimRewardBalanceOperation
  fill_recurrent_transfer_operation: FillRecurrentTransferOperation
  fill_vesting_withdraw_operation: FillVestingWithdrawOperation
  transfer_to_vesting_completed_operation: TransferToVestingCompletedOperation
  transfer_operation: TransferOperation
  fill_order_operation: FillOrderOperation
  transfer_from_savings_operation: TransferFromSavingsOperation
  account_create_operation: AccountCreateOperation
  fill_collateralized_convert_request_operation: FillCollateralizedConvertRequestOperation
  fill_convert_request_operation: FillConvertRequestOperation
  claim_account_operation: ClaimAccountOperation
  fill_transfer_from_savings_operation: FillTransferFromSavingsOperation
  transfer_to_savings_operation: TransferToSavingsOperation
  author_reward_operation: AuthorRewardOperation
  convert_operation: ConvertOperation
  collateralized_convert_operation: CollateralizedConvertOperation
  collateralized_convert_immediate_conversion_operation: CollateralizedConvertImmediateConversionOperation
  interest_operation: InterestOperation
  comment_benefactor_reward_operation: CommentBenefactorRewardOperation
  curation_reward_operation: CurationRewardOperation
}

export interface TransferOperation {
  type: 'transfer_operation'
  value: {
    from: string
    to: string
    amount: string | HiveAsset | HiveAssetObject
    memo: string
  }
}

export interface FillRecurrentTransferOperation {
  type: 'fill_recurrent_transfer_operation'
  value: {
    from: string
    to: string
    amount: string | HiveAsset | HiveAssetObject
    memo: string
  }
}

export interface TransferToVestingCompletedOperation {
  type: 'transfer_to_vesting_completed_operation'
  value: {
    from_account: string
    hive_vested: string | HiveAsset | HiveAssetObject
    to_account: string
    vesting_shares_received: string | HiveAsset | HiveAssetObject
  }
}

export interface ClaimRewardBalanceOperation {
  type: 'claim_reward_balance_operation'
  value: {
    account: string
    reward_hive: string | HiveAsset | HiveAssetObject
    reward_hbd: string | HiveAsset | HiveAssetObject
    reward_vests: string | HiveAsset | HiveAssetObject
  }
}

export interface FillVestingWithdrawOperation {
  type: 'fill_vesting_withdraw_operation'
  value: {
    from_account: string
    to_account: string
    withdrawn: string | HiveAsset | HiveAssetObject
    deposited: string | HiveAsset | HiveAssetObject
  }
}

export interface FillOrderOperation {
  type: 'fill_order_operation'
  value: {
    current_pays: string | HiveAsset | HiveAssetObject
    open_pays: string | HiveAsset | HiveAssetObject
    current_owner: string
    open_owner: string
  }
}

export interface TransferFromSavingsOperation {
  type: 'transfer_from_savings_operation'
  value: {
    from: string
    to: string
    amount: string | HiveAsset | HiveAssetObject
    memo: string
    request_id: number
  }
}

export interface TransferToSavingsOperation {
  type: 'transfer_to_savings_operation'
  value: {
    from: string
    to: string
    amount: string | HiveAsset | HiveAssetObject
    memo: string
  }
}

export interface AuthorRewardOperation {
  type: 'author_reward_operation'
  value: {
    author: string
    permlink: string
    curators_vesting_payout: string | HiveAsset | HiveAssetObject
    hbd_payout: string | HiveAsset | HiveAssetObject
    hive_payout: string | HiveAsset | HiveAssetObject
    vesting_payout: string | HiveAsset | HiveAssetObject
    payout_must_be_claimed: boolean
  }
}

export interface CurationRewardOperation {
  type: 'curation_reward_operation'
  value: {
    author: string
    permlink: string
    curator: string
    reward: string | HiveAsset | HiveAssetObject
    payout_must_be_claimed: boolean
  }
}

export interface CommentBenefactorRewardOperation {
  type: 'comment_benefactor_reward_operation'
  value: {
    author: string
    permlink: string
    benefactor: string
    hbd_payout: string | HiveAsset | HiveAssetObject
    hive_payout: string | HiveAsset | HiveAssetObject
    vesting_payout: string | HiveAsset | HiveAssetObject
    payout_must_be_claimed: boolean
  }
}

export interface AccountCreateOperation {
  type: 'account_create_operation'
  value: {
    fee: string | HiveAsset | HiveAssetObject
    creator: string
    new_account_name: string
  }
}

export interface ClaimAccountOperation {
  type: 'claim_account_operation'
  value: {
    creator: string
    extensions: any[]
    fee: string | HiveAsset | HiveAssetObject
  }
}

export interface ConvertOperation {
  type: 'convert_operation'
  value: {
    owner: string
    amount: string | HiveAsset | HiveAssetObject
    request_id: number
  }
}

export interface CollateralizedConvertOperation {
  type: 'collateralized_convert_operation'
  value: {
    owner: string
    amount: string | HiveAsset | HiveAssetObject
    request_id: number
  }
}

export interface FillConvertRequestOperation {
  type: 'fill_convert_request_operation'
  value: {
    owner: string
    amount_in: string | HiveAsset | HiveAssetObject
    amount_out: string | HiveAsset | HiveAssetObject
    request_id: number
  }
}

export interface FillCollateralizedConvertRequestOperation {
  type: 'fill_collateralized_convert_request_operation'
  value: {
    owner: string
    amount_in: string | HiveAsset | HiveAssetObject
    amount_out: string | HiveAsset | HiveAssetObject
    excess_collateral: string | HiveAsset | HiveAssetObject
    request_id: number
  }
}

export interface FillTransferFromSavingsOperation {
  type: 'fill_transfer_from_savings_operation'
  value: {
    from: string
    to: string
    amount: string | HiveAsset | HiveAssetObject
    memo: string
    request_id: number
  }
}

export interface CollateralizedConvertImmediateConversionOperation {
  type: 'collateralized_convert_immediate_conversion_operation'
  value: {
    owner: string
    hbd_out: string | HiveAsset | HiveAssetObject
    request_id: number
  }
}

export interface InterestOperation {
  type: 'interest_operation'
  value: {
    owner: string
    interest: string | HiveAsset | HiveAssetObject
    is_saved_into_hbd_balance: boolean
  }
}

export default Operation
