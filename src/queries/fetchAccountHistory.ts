import {
  QueryFunctionContext,
  QueryKey,
  queryOptions,
} from '@tanstack/react-query'

interface FetchAccountHistoryParams {
  _account: string
  _date_start: string
  _date_end: string
  _body_limit: number
  _page_size: number
  _page_num: number
  _filter?: number[]
}

interface FetchAccountHistoryOptions extends QueryKey {
  0: 'accountHistory'
  1: FetchAccountHistoryParams
}

const endpoints = ['https://hiveapi.actifit.io', 'https://techcoderx.com']

export async function fetchAccountHistory({
  queryKey,
}: QueryFunctionContext<FetchAccountHistoryOptions>) {
  const [_key, params] = queryKey
  let currentEndpoint = 0
  const response = await fetch(
    `${endpoints[currentEndpoint]}/hafbe/get_ops_by_account`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    },
  )
  if (!response.ok) {
    currentEndpoint = (currentEndpoint + 1) % endpoints.length
    throw new Error('Network response was not ok')
  }
  return response.json()
}

export default function useFetchAccountHistory(
  params: FetchAccountHistoryParams,
  enabled: boolean,
) {
  return queryOptions({
    queryKey: ['accountHistory', params],
    queryFn: fetchAccountHistory,
    enabled,
  })
}
