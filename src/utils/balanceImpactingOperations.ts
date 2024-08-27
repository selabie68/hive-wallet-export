import * as dhive from '@hiveio/dhive'

const op = dhive.utils.operationOrders

export const balanceImpactingOperations = [
  { label: 'Transfer', value: op.transfer },
  { label: 'Transfer to Vesting', value: op.transfer_to_vesting_completed },
  { label: 'Create Account', value: op.account_create },
  { label: 'Claim Account', value: op.claim_account },
  { label: 'Escrow Transfer', value: op.escrow_transfer },
  { label: 'Escrow Release', value: op.escrow_release },
  { label: 'Producer Reward', value: op.producer_reward },
  { label: 'Proposal Pay', value: op.proposal_pay },
  { label: 'Proposal Pay', value: op.create_proposal },
  { label: 'PoW Reward', value: op.pow_reward },
  { label: 'Author Reward', value: op.author_reward },
  { label: 'Comment Benefactor', value: op.comment_benefactor_reward },
  { label: 'Curation Reward', value: op.curation_reward },
  {
    label: 'Fill Collateralized Convert Request',
    value: op.fill_collateralized_convert_request,
  },
  { label: 'Collateralized Convert', value: op.collateralized_convert },
  { label: 'Collateralized Convert Immediate Conversion Operation', value: 88 },
  { label: 'Interest', value: op.interest },
  { label: 'Liquidity Reward', value: op.liquidity_reward },
  { label: 'Fill Convert Request', value: op.fill_convert_request },
  { label: 'Convert', value: op.convert },
  { label: 'Fill Order', value: op.fill_order },
  { label: 'Claim Reward Balance', value: op.claim_reward_balance },
  { label: 'Fill Vesting Withdraw', value: op.fill_vesting_withdraw },
  { label: 'Fill Recurrent Transfer', value: op.fill_recurrent_transfer },
]
