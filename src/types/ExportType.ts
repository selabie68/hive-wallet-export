export enum ExportType {
  Generic,
  Koinly,
  CryptoTaxCalculator,
}

export class GenericExport {
  type = ExportType.Generic
  name = 'Generic'
}

export class KoinlyExport {
  type = ExportType.Koinly
  name = 'Koinly'
}

export class CryptoTaxCalculatorExport {
  type = ExportType.CryptoTaxCalculator
  name = 'CryptoTaxCalculator'
}
