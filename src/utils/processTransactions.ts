import React from 'react'

import Papa from 'papaparse'

import { ExportType } from '@/types/ExportType'
import {
  CryptoTaxCalculatorHeaders,
  GenericHeaders,
} from '@/utils/CsvFileHeaders'
import { HiveAccountTransaction } from '@/utils/HiveAccountTransaction'
import { transferOperationHandler } from './handlers/Operations/TransferOperation'
import { genericExporterHandler } from './handlers/Exporters/GenericExporter'
import {
  AccountCreateOperation,
  AuthorRewardOperation,
  ClaimAccountOperation,
  ClaimRewardBalanceOperation,
  CollateralizedConvertImmediateConversionOperation,
  CollateralizedConvertOperation,
  CommentBenefactorRewardOperation,
  ConvertOperation,
  CurationRewardOperation,
  FillCollateralizedConvertRequestOperation,
  FillConvertRequestOperation,
  FillOrderOperation,
  FillVestingWithdrawOperation,
  InterestOperation,
  TransferOperation,
  TransferToVestingCompletedOperation,
} from '@/types/Operation'
import { transferToVestingCompletedOperationHandler } from './handlers/Operations/TransferToVestingCompletedOperation'
import { Transaction } from '@/types/Transaction'
import { claimRewardBalanceOperationHandler } from './handlers/Operations/ClaimRewardBalanceOperation'
import { fillVestingWithdrawOperationHandler } from './handlers/Operations/FillVestingWithdrawOperation'
import { fillOrderOperationHandler } from './handlers/Operations/FillOrderOperation'
import { accountCreateOperationHandler } from './handlers/Operations/AccountCreateOperation'
import { fillConvertRequestOperationHandler } from './handlers/Operations/FillConvertRequestOperation'
import { authorRewardOperationHandler } from './handlers/Operations/AuthorRewardOperation'
import { convertOperationHandler } from './handlers/Operations/ConvertOperation'
import { collateralizedConvertImmediateConversionOperationHandler } from './handlers/Operations/CollateralizedConvertImmediateConversionOperation'
import { curationRewardOperationHandler } from './handlers/Operations/CurationRewardOperation'
import { interestOperationHandler } from './handlers/Operations/InterestOperation'
import { claimAccountOperationHandler } from './handlers/Operations/ClaimAccountOperation'
import { cryptoTaxCalculatorExporterHandler } from './handlers/Exporters/CryptoTaxCalculatorExporter'
import { groupRewardsBetween } from './groupRewardsBetween'
import { HiveAsset } from './HiveAsset'

export const processTransactions = (
  transactions: any[],
  exportType: ExportType,
  username: string,
  groupRewards: boolean,
  reconcileDays: boolean,
  setOutput: React.Dispatch<React.SetStateAction<string[]>>,
) => {
  let ops: Transaction[] = []
  const exportTypeName = ExportType[exportType]

  setOutput((output) => [...output, `Export type: ${exportTypeName}`])

  const csv: ExportCsvFile = {
    lines: [],
  }

  switch (exportType) {
    case ExportType.Koinly: {
      // TODO: Add support for Koinly
      break
    }

    case ExportType.CryptoTaxCalculator: {
      csv.headers = CryptoTaxCalculatorHeaders
      break
    }

    case ExportType.Generic:
    default: {
      csv.headers = GenericHeaders
      break
    }
  }

  setOutput((output) => [
    ...output,
    `Processing ${transactions.length} transactions for ${username}...`,
  ])

  for (const tr of transactions) {
    const transaction = new HiveAccountTransaction(tr)
    const operation = transaction.operation

    switch (operation.type) {
      case 'account_create_operation': {
        ops.push(
          ...accountCreateOperationHandler(
            <HiveAccountTransaction<AccountCreateOperation>>transaction,
            username,
          ),
        )

        break
      }

      case 'claim_account_operation': {
        ops.push(
          ...claimAccountOperationHandler(
            <HiveAccountTransaction<ClaimAccountOperation>>transaction,
            username,
          ),
        )

        break
      }

      case 'curation_reward_operation': {
        ops.push(
          ...curationRewardOperationHandler(
            <HiveAccountTransaction<CurationRewardOperation>>transaction,
          ),
        )

        break
      }

      case 'interest_operation': {
        ops.push(
          ...interestOperationHandler(
            <HiveAccountTransaction<InterestOperation>>transaction,
          ),
        )

        break
      }

      case 'comment_benefactor_reward_operation':
      case 'author_reward_operation': {
        ops.push(
          ...authorRewardOperationHandler(
            <
              HiveAccountTransaction<
                AuthorRewardOperation | CommentBenefactorRewardOperation
              >
            >transaction,
          ),
        )

        break
      }

      case 'transfer_operation':
      case 'fill_recurrent_transfer_operation': {
        ops.push(
          ...transferOperationHandler(
            <HiveAccountTransaction<TransferOperation>>transaction,
          ),
        )

        break
      }

      case 'transfer_to_vesting_completed_operation': {
        ops.push(
          ...transferToVestingCompletedOperationHandler(
            <HiveAccountTransaction<TransferToVestingCompletedOperation>>(
              transaction
            ),
            username,
          ),
        )

        break
      }

      case 'claim_reward_balance_operation': {
        ops.push(
          ...claimRewardBalanceOperationHandler(
            <HiveAccountTransaction<ClaimRewardBalanceOperation>>transaction,
            username,
          ),
        )

        break
      }

      case 'fill_vesting_withdraw_operation': {
        ops.push(
          ...fillVestingWithdrawOperationHandler(
            <HiveAccountTransaction<FillVestingWithdrawOperation>>transaction,
            username,
          ),
        )

        break
      }

      case 'fill_order_operation': {
        ops.push(
          ...fillOrderOperationHandler(
            <HiveAccountTransaction<FillOrderOperation>>transaction,
          ),
        )

        break
      }

      case 'collateralized_convert_operation':
      case 'convert_operation': {
        ops.push(
          ...convertOperationHandler(
            <
              HiveAccountTransaction<
                ConvertOperation | CollateralizedConvertOperation
              >
            >transaction,
          ),
        )

        break
      }

      case 'collateralized_convert_immediate_conversion_operation': {
        ops.push(
          ...collateralizedConvertImmediateConversionOperationHandler(
            <
              HiveAccountTransaction<CollateralizedConvertImmediateConversionOperation>
            >transaction,
          ),
        )

        break
      }

      case 'fill_collateralized_convert_request_operation':
      case 'fill_convert_request_operation': {
        ops.push(
          ...fillConvertRequestOperationHandler(
            <
              HiveAccountTransaction<
                | FillConvertRequestOperation
                | FillCollateralizedConvertRequestOperation
              >
            >transaction,
          ),
        )

        break
      }

      default:
        // @ts-expect-error console warn for unsupported types
        console.warn(`Unknown operation type: ${operation.type}`)
        break
    }
  }

  if (groupRewards) {
    ops = groupRewardsBetween(ops, reconcileDays)
  }

  if (exportType === ExportType.Generic) {
    for (const op of ops) {
      const line = genericExporterHandler(op, username)

      if (line && line[7] && csv.lines) {
        csv.lines.push(line)
      }
    }

    // Sort by block number ASC
    csv.lines = csv.lines
      ?.filter((l?: any[]) => typeof l !== 'undefined')
      .sort((a: any[], b: any[]) => Number(a[2]) - Number(b[2]))

    // Calculate running totals
    let hiveRunningTotal = new HiveAsset('0 HIVE')
    let hbdRunningTotal = new HiveAsset('0 HBD')
    let vestsRunningTotal = new HiveAsset('0 VESTS')

    for (const line of csv.lines || []) {
      const debit = line[9] || new HiveAsset(`0 ${line[7].symbol}`)
      const credit = line[10] || new HiveAsset(`0 ${line[7].symbol}`)

      if (line[7].symbol === 'HIVE') {
        hiveRunningTotal = hiveRunningTotal.minus(debit)
        hiveRunningTotal = hiveRunningTotal.plus(credit)
      } else if (line[7].symbol === 'HBD') {
        hbdRunningTotal = hbdRunningTotal.minus(debit)
        hbdRunningTotal = hbdRunningTotal.plus(credit)
      } else if (line[7].symbol === 'VESTS') {
        vestsRunningTotal = vestsRunningTotal.minus(debit)
        vestsRunningTotal = vestsRunningTotal.plus(credit)
      }

      line[7] = line[7].toFixedString()
      line[9] = line[9].toFixed()
      line[10] = line[10].toFixed()
      line[11] = hiveRunningTotal.toFixed()
      line[12] = hbdRunningTotal.toFixed()
      line[13] = vestsRunningTotal.toFixed()
    }
  } else if (exportType === ExportType.CryptoTaxCalculator) {
    for (const op of ops) {
      const line = cryptoTaxCalculatorExporterHandler(op, username)

      if (csv.lines && line) {
        csv.lines.push(line)
      }
    }

    // Filter out any undefined lines
    csv.lines = csv.lines?.filter((l?: any[]) => typeof l !== 'undefined')
  }

  if (csv.headers && csv.lines) {
    setOutput((output) => [...output, `Exporting CSV for ${username}...`])
    const csvContent = Papa.unparse(
      { fields: csv.headers, data: csv.lines },
      {
        header: true,
      },
    )

    // Download the CSV file
    const element = document.createElement('a')
    element.href = `data:text/csv;charset=utf-8,${encodeURIComponent(
      csvContent || '',
    )}`
    element.target = '_blank'
    element.download = `hive-wallet-export-${username}.csv`
    element.click()
  } else {
    setOutput((output) => [...output, `No transactions found.`])
  }

  // Release Memory
  csv.lines = undefined

  setOutput((output) => [...output, `Exporting Complete.`])
}
