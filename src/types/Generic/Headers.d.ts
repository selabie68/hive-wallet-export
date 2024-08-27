interface GenericHeaders extends ArrayLike<string> {
  id: string
  trx: string
  block: string
  timestamp: string
  type: string
  from: string
  to: string
  amount: string
  memo: string
  debit: string
  credit: string
  hiveRunningTotal: string
  hbdRunningTotal: string
  vestsRunningTotal: string
}
