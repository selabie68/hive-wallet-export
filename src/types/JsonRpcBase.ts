import { HiveApiError } from './HiveApiError'

export interface JsonRpcRequest<K, T> {
  id: string | number
  jsonrpc: string
  method: K
  params: T
}

export interface JsonRpcResponse<T> {
  id: string | number
  jsonrpc: string
  result?: T
  error?: HiveApiError
}
