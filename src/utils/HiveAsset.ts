import Big, { RoundingMode } from 'big.js'

export interface HiveAssetObject {
  amount: string
  precision: number
  nai: string
  bigNum?: boolean
}

export type HiveAssetSymbol = 'HBD' | 'HIVE' | 'VESTS'

export class HiveAsset extends Big {
  precision: number
  nai: string

  constructor(
    asset:
      | HiveAsset
      | HiveAssetObject
      | string
      | `${string} HIVE`
      | `${string} HBD`
      | `${string} VESTS`,
  ) {
    if (
      typeof asset === 'string' &&
      (asset.includes(' HBD') ||
        asset.includes(' HIVE') ||
        asset.includes(' VESTS'))
    ) {
      asset = HiveAsset.fromString(asset)
    } else if (typeof asset === 'string') {
      throw new Error('Invalid asset')
    }

    if (isHiveAsset(asset)) {
      super(asset)
    } else if (asset.bigNum) {
      super(asset.amount)
    } else {
      super(Number(asset.amount) / Math.pow(10, asset.precision))
    }

    this.precision = asset.precision
    this.nai = asset.nai
  }

  private static fromString(amountSymbol: string) {
    const [amount, symbol] = amountSymbol.split(' ')

    let precision = 0
    let nai = ''

    switch (symbol) {
      case 'HBD':
        nai = '@@000000013'
        precision = 3
        break
      case 'HIVE':
        nai = '@@000000021'
        precision = 3
        break
      case 'VESTS':
        nai = '@@000000037'
        precision = 6
        break
      default:
        throw new Error('Unknown symbol')
    }

    return {
      amount: (Number(amount) * Math.pow(10, precision)).toString(),
      precision,
      nai,
    }
  }

  get symbol(): HiveAssetSymbol {
    switch (this.nai) {
      case '@@000000013':
        return 'HBD'
      case '@@000000021':
        return 'HIVE'
      case '@@000000037':
        return 'VESTS'
      default:
        throw new Error('Unknown NAI')
    }
  }

  plus(other: HiveAsset) {
    return new HiveAsset({
      amount: super.plus(other).toFixed(this.precision),
      precision: this.precision,
      nai: this.nai,
      bigNum: true,
    })
  }

  minus(other: HiveAsset) {
    return new HiveAsset({
      amount: super.minus(other).toFixed(this.precision),
      precision: this.precision,
      nai: this.nai,
      bigNum: true,
    })
  }

  toFixedString(dp?: number, rm?: RoundingMode) {
    return `${this.toFixed(dp || this.precision, rm)} ${this.symbol}`
  }
}

export const isHiveAsset = (asset: any): asset is HiveAsset =>
  asset instanceof HiveAsset
