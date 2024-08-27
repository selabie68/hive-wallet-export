import axios from 'axios'

interface HistoryRecord {
  _id: string
  blockNumber: number
  transactionId: string
  timestamp: number
  operation: string
  authorperm: string
  from: string
  to: string
  symbol: string
  quantity: string
  memo: string
  account: string
}

const getHiveEngineHistory = (
  account: string,
  limit: number,
  offset: number,
) => {
  return new Promise<HistoryRecord[]>((resolve, reject) => {
    const url = `https://accounts.hive-engine.com/accountHistory?account=${account}&limit=${limit}&offset=${offset}`

    axios
      .get<HistoryRecord[]>(url)
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

export default getHiveEngineHistory
