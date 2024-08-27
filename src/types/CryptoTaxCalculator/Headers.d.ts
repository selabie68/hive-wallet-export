interface CryptoTaxCalculatorHeaders extends ArrayLike<string> {
  timestamp: string
  type: string
  baseCurrency: string
  baseAmount: string
  quoteCurrency: string
  quoteAmount: string
  feeCurrency: string
  feeAmount: string
  from: string
  to: string
  blockchain: string
  id: string
  description: string
  referencePricePerUnit: string
  referencePriceCurrency: string
}
