import type { Dayjs } from 'dayjs'

interface CryptoTaxCalculatorLine {
  timestamp: Dayjs | string
  type:
    | 'buy'
    | 'sell'
    | 'send'
    | 'receive'
    | 'income'
    | 'expense'
    | 'lost'
    | 'mining'
    | 'gift'
    | 'staking'
    | 'staking-deposit'
    | 'staking-withdrawal'
    | 'interest'
    | 'burn'
    | 'airdrop'
    | 'chain-split'
  baseCurrency: string
  baseAmount: string
  quoteCurrency: string | ''
  quoteAmount: string | ''
  feeCurrency: string | ''
  feeAmount: string | ''
  from: string | ''
  to: string | ''
  blockchain: string | ''
  id: string | ''
  description: string | ''
  referencePricePerUnit: string | ''
  referencePriceCurrency: string | ''
}
