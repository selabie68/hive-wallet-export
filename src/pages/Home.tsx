import { useEffect, useRef, useState } from 'react'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Layout,
  Row,
  Select,
  Space,
  Switch,
  theme,
} from 'antd'
import dayjs from 'dayjs'
import * as dhive from '@hiveio/dhive'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

import type { Dayjs } from 'dayjs'

import { ReactComponent as Logo } from '../assets/logo.svg'

import ExportType from '@/types/ExportType'
import FillVestingWithdrawOperation from '@/types/FillVestingWithdrawOperation'
import FillOrderOperation from '@/types/FillOrderOperation'

const { Header, Content } = Layout
const { RangePicker } = DatePicker

const hive = new dhive.Client([
  'https://hive-api.arcange.eu',
  'https://api.hive.blog',
  'https://api.hivekings.com',
  'https://anyx.io',
  'https://api.openhive.network',
])

const op = dhive.utils.operationOrders
const operationsBitmask = dhive.utils.makeBitMaskFilter([
  op.transfer,
  op.transfer_to_vesting,
  op.withdraw_vesting,
  op.interest,
  op.liquidity_reward,
  op.transfer_to_savings,
  op.transfer_from_savings,
  op.fill_convert_request,
  op.fill_order,
  op.claim_reward_balance,
  op.fill_vesting_withdraw,
  op.fill_recurrent_transfer,
]) as [number, number]

const defaultDateRange = [
  dayjs().subtract(1, 'month').startOf('month'),
  dayjs().subtract(1, 'month').endOf('month'),
]

const auFy = [
  dayjs().startOf('year').subtract(6, 'months'),
  dayjs().endOf('year').subtract(6, 'months'),
]

const usFy = [
  dayjs().subtract(1, 'year').startOf('year'),
  dayjs().subtract(1, 'year').endOf('year'),
]

interface PriceData {
  [date: string]: number
}

interface FormValues {
  username: string
  dateRange: [dayjs.Dayjs, dayjs.Dayjs]
  exportType: ExportType
}

interface HomePageProps {
  setDarkMode: (darkMode: boolean) => void
  darkMode: boolean
}

function HomePage({ setDarkMode, darkMode }: HomePageProps) {
  const [form] = Form.useForm<FormValues>()
  const [output, setOutput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const dateRangeValue = Form.useWatch('dateRange', form)
  const outputConsole = useRef<HTMLPreElement>(null)

  const {
    token: { colorBgContainer },
  } = theme.useToken()

  useEffect(() => {
    if (outputConsole.current) {
      outputConsole.current.scrollTop = outputConsole.current.scrollHeight
    }
  }, [output])

  const setLastMonth = () => {
    form.setFieldsValue({
      dateRange: defaultDateRange,
    })
  }

  // Set the date range to the last Australian financial year
  const setAuFy = () => {
    form.setFieldsValue({
      dateRange: auFy,
    })
  }

  // Set the date range to the last American financial year
  const setUsFy = () => {
    form.setFieldsValue({
      dateRange: usFy,
    })
  }

  // Use CoinGecko API to get price data for date range
  const getPrices = async (symbol: string, start: Dayjs, end: Dayjs) => {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart/range?vs_currency=usd&from=${start.unix()}&to=${end.unix()}`,
    )

    const data = await response.json()

    // Convert to object with date as key and price as value
    const prices = data.prices.reduce(
      (acc: PriceData, [date, price]: [number, number]) => {
        acc[dayjs(date).format('YYYY-MM-DD')] = price

        return acc
      },
      {},
    )

    return prices
  }

  const getTransactions = async (username: string, from: number) => {
    // Use dhive to get the data from the blockchain
    return hive.database.getAccountHistory(
      username,
      from,
      1000,
      operationsBitmask,
    )
  }

  const onFinish = async (values: FormValues) => {
    setLoading(true)
    const { username, dateRange, exportType } = values
    const [startDate, endDate] = dateRange
    const exportTypeName =
      exportType === ExportType.Koinly ? 'Koinly' : 'CryptoTaxCalculator'

    const start = startDate.format('YYYY-MM-DD')
    const end = endDate.format('YYYY-MM-DD')
    let currentFrom = -1
    let page = 1

    setOutput(`Exporting data for ${username}...\n`)
    setOutput((output) => `${output}Date range: ${start} to ${end}\n`)
    setOutput((output) => `${output}Export type: ${exportTypeName}\n`)
    setOutput((output) => `${output}Getting price data...\n`)

    const priceDataHive = await getPrices('hive', startDate, endDate)
    const priceDataHbd = await getPrices('hive_dollar', startDate, endDate)

    const headers = []

    if (exportType === ExportType.Koinly) {
      headers.push(
        'Date',
        'Sent Amount',
        'Sent Currency',
        'Received Amount',
        'Received Currency',
        'Fee Amount',
        'Fee Currency',
        'Net Worth Amount',
        'Net Worth Currency',
        'Label',
        'Description',
        'TxHash',
      )
    } else if (exportType === ExportType.CryptoTaxCalculator) {
      headers.push(
        'Timestamp (UTC)',
        'Type',
        'Base Currency',
        'Base Amount',
        'Quote Currency (Optional)',
        'Quote Amount (Optional)',
        'Fee Currency (Optional)',
        'Fee Amount (Optional)',
        'From (Optional)',
        'To (Optional)',
        'Blockchain (Optional)',
        'ID (Optional)',
        'Description (Optional)',
        'Reference Price Per Unit (Optional)',
        'Reference Price Currency (Optional)',
      )
    }

    // Generate the CSV file
    const csv = [headers]

    // Keep track of whether we've reached the end of the date range
    let finishedLooping = false

    // Loop through transactions until we reach the end of the date range
    while (finishedLooping === false) {
      setOutput((output) => `${output}Getting transactions page ${page}...\n`)
      const result = await getTransactions(username, currentFrom)
      setOutput((output) => `${output}Found ${result.length} transactions.\n`)

      result.forEach(([, operation]) => {
        const timestamp = dayjs(operation.timestamp)

        // Only include operations within the date range
        if (!timestamp.isBetween(start, end, 'day', '[]')) {
          return
        }

        const usdPriceHive = priceDataHive[timestamp.format('YYYY-MM-DD')]
        const usdPriceHbd = priceDataHbd[timestamp.format('YYYY-MM-DD')]

        // op.transfer,
        // op.transfer_to_vesting,
        // op.withdraw_vesting,
        // op.interest,
        // op.liquidity_reward,
        // op.transfer_to_savings,
        // op.transfer_from_savings,
        // op.fill_convert_request,
        // op.fill_order,
        // op.claim_reward_balance,
        // op.fill_vesting_withdraw,

        console.log(operation)

        switch (operation.op[0]) {
          case 'transfer':
          case 'transfer_to_vesting': {
            const op = operation.op as dhive.TransferOperation
            const [amountStr, symbol] = String(op[1].amount).split(' ')
            const amount = Number(amountStr.replace(/,/g, ''))
            const to = op[1].to
            // make the memo safe for CSV
            const memo = op[1].memo
              ? op[1].memo
                  .replace(/"/g, '""')
                  .replace(/\n/g, ' ')
                  .replace(/\r/g, ' ')
                  .replace(/,/g, ' ')
                  .replace(/;/g, ' ')
              : ''
            const txHash = operation.trx_id

            if (exportType === ExportType.Koinly) {
              csv.push([
                timestamp.format('YYYY-MM-DD HH:mm:ss UTC'), // Date
                to === username ? '' : amountStr, // Sent Amount
                to === username ? '' : symbol, // Sent Currency
                to === username ? amountStr : '', // Received Amount
                to === username ? symbol : '', // Received Currency
                '', // Fee Amount
                '', // Fee Currency
                symbol === 'HIVE'
                  ? (amount * usdPriceHive).toFixed(2)
                  : (amount * usdPriceHbd).toFixed(2), // Net Worth Amount
                'USD', // Net Worth Currency
                to === username ? 'receive' : 'send', // Label
                memo, // Description
                txHash, // TxHash
              ])
            } else if (exportType === ExportType.CryptoTaxCalculator) {
              csv.push([
                timestamp.format('YYYY-MM-DD HH:mm:ss'), // Timestamp (UTC)
                to === username ? 'receive' : 'send', // Type
                symbol, // Base Currency
                amount, // Base Amount
                '', // Quote Currency
                '', // Quote Amount
                '', // Fee Currency
                '', // Fee Amount
                '', // From
                '', // To
                'Hive', // Blockchain
                txHash, // ID
                memo, // Description
                symbol === 'HIVE' ? usdPriceHive : usdPriceHbd, // Reference Price Per Unit
                'USD', // Reference Price Currency
              ])
            }

            break
          }
          case 'claim_reward_balance': {
            const op = operation.op as dhive.ClaimRewardBalanceOperation

            const [rewardHiveStr] = String(op[1].reward_hive).split(' ')
            const [rewardHbdStr] = String(op[1].reward_hbd).split(' ')
            // const [rewardVestsStr] = String(
            //   op[1].reward_vests,
            // ).split(' ')

            const rewardHive = Number(rewardHiveStr.replace(/,/g, ''))
            const rewardHbd = Number(rewardHbdStr.replace(/,/g, ''))
            // const rewardVests = Number(rewardVestsStr.replace(/,/g, ''))
            const txHash = operation.trx_id

            if (exportType === ExportType.Koinly) {
              const csvLineTemplate = [
                timestamp.format('YYYY-MM-DD HH:mm:ss UTC'), // Date
                '', // Sent Amount
                '', // Sent Currency
                '', // Received Amount
                '', // Received Currency
                '', // Fee Amount
                '', // Fee Currency
                '', // Net Worth Amount
                'USD', // Net Worth Currency
                'mining', // Label
                '', // Description
                txHash, // TxHash
              ]

              if (rewardHive > 0) {
                const csvLine = [...csvLineTemplate]
                csvLine[3] = rewardHive.toFixed(2)
                csvLine[4] = 'HIVE'
                csvLine[7] = (rewardHive * usdPriceHive).toFixed(2)

                csv.push(csvLine)
              }

              if (rewardHbd > 0) {
                const csvLine = [...csvLineTemplate]
                csvLine[3] = rewardHbd.toFixed(2)
                csvLine[4] = 'HBD'
                csvLine[7] = (rewardHbd * usdPriceHbd).toFixed(2)

                csv.push(csvLine)
              }

              // if (rewardVests > 0) {
              //   const csvLine = [...csvLineTemplate]
              //   csvLine[3] = rewardVests.toFixed(2)
              //   csvLine[4] = 'VESTS'

              //   csv.push(csvLine)
              // }
            } else if (exportType === ExportType.CryptoTaxCalculator) {
              const csvLineTemplate = [
                timestamp.format('YYYY-MM-DD HH:mm:ss'), // Timestamp (UTC)
                'receive', // Type
                '', // Base Currency
                '', // Base Amount
                '', // Quote Currency
                '', // Quote Amount
                '', // Fee Currency
                '', // Fee Amount
                '', // From
                '', // To
                'Hive', // Blockchain
                txHash, // ID
                '', // Description
                '', // Reference Price Per Unit
                'USD', // Reference Price Currency
              ]

              if (rewardHive > 0) {
                const csvLine = [...csvLineTemplate]
                csvLine[2] = 'HIVE'
                csvLine[3] = rewardHive.toFixed(2)
                csvLine[7] = usdPriceHive

                csv.push(csvLine)
              }

              if (rewardHbd > 0) {
                const csvLine = [...csvLineTemplate]
                csvLine[2] = 'HBD'
                csvLine[3] = rewardHbd.toFixed(2)
                csvLine[7] = usdPriceHbd

                csv.push(csvLine)
              }

              // if (rewardVests > 0) {
              //   const csvLine = [...csvLineTemplate]
              //   csvLine[2] = 'VESTS'
              //   csvLine[3] = rewardVests.toFixed(2)

              //   csv.push(csvLine)
              // }
            }
            break
          }
          case 'fill_vesting_withdraw': {
            const op = operation.op as unknown as FillVestingWithdrawOperation

            const [depositedStr, assetName] = String(op[1].deposited).split(' ')
            const deposited = Number(depositedStr.replace(/,/g, ''))
            const txHash = operation.trx_id
            if (exportType === ExportType.Koinly) {
              csv.push([
                timestamp.format('YYYY-MM-DD HH:mm:ss UTC'), // Date
                '', // Sent Amount
                '', // Sent Currency
                deposited.toFixed(2), // Received Amount
                assetName, // Received Currency
                '', // Fee Amount
                '', // Fee Currency
                assetName === 'HIVE'
                  ? (deposited * usdPriceHive).toFixed(2)
                  : (deposited * usdPriceHbd).toFixed(2), // Net Worth Amount
                'USD', // Net Worth Currency
                'staking', // Label
                '', // Description
                String(txHash), // TxHash
              ])
            } else if (exportType === ExportType.CryptoTaxCalculator) {
              csv.push([
                timestamp.format('YYYY-MM-DD HH:mm:ss'), // Timestamp (UTC)
                'receive', // Type
                assetName, // Base Currency
                deposited.toFixed(2), // Base Amount
                '', // Quote Currency
                '', // Quote Amount
                '', // Fee Currency
                '', // Fee Amount
                '', // From
                '', // To
                'Hive', // Blockchain
                txHash, // ID
                'Powerdown', // Description
                assetName === 'HIVE'
                  ? usdPriceHive.toFixed(2)
                  : usdPriceHbd.toFixed(2), // Reference Price Per Unit
                'USD', // Reference Price Currency
              ])
            }

            break
          }
          case 'fill_order': {
            const op = operation.op as unknown as FillOrderOperation

            const currentOwner = op[1].current_owner
            const [currentPaysStr, currentPaysAssetName] = String(
              op[1].current_pays,
            ).split(' ')
            const currentPays = Number(currentPaysStr.replace(/,/g, ''))

            const openOwner = op[1].open_owner
            const [openPaysStr, openPaysAssetName] = String(
              op[1].open_pays,
            ).split(' ')
            const openPays = Number(openPaysStr.replace(/,/g, ''))
            const txHash = operation.trx_id

            if (exportType === ExportType.Koinly) {
              csv.push([
                timestamp.format('YYYY-MM-DD HH:mm:ss UTC'), // Date
                currentOwner === username
                  ? currentPays.toFixed(3)
                  : openPays.toFixed(3), // Sent Amount
                currentOwner === username
                  ? currentPaysAssetName
                  : openPaysAssetName, // Sent Currency
                currentOwner === username
                  ? openPays.toFixed(3)
                  : currentPays.toFixed(3), // Received Amount
                currentOwner === username
                  ? openPaysAssetName
                  : currentPaysAssetName, // Received Currency
                '', // Fee Amount
                '', // Fee Currency
                currentPaysAssetName === 'HIVE'
                  ? (currentPays * usdPriceHive).toFixed(2)
                  : (openPays * usdPriceHive).toFixed(2), // Net Worth Amount
                'USD', // Net Worth Currency
                'trade', // Label
                `Hive on-chain market trade ${currentOwner} ${currentPaysStr} ${currentPaysAssetName} to ${openOwner} ${openPaysStr} ${openPaysAssetName}`, // Description
                String(txHash), // TxHash
              ])
            } else if (exportType === ExportType.CryptoTaxCalculator) {
              csv.push([
                timestamp.format('YYYY-MM-DD HH:mm:ss'), // Timestamp (UTC)
                currentOwner === username ? 'buy' : 'sell', // Type
                openPaysAssetName, // Base Currency
                openPays.toFixed(3), // Base Amount
                currentPaysAssetName, // Quote Currency
                currentPays.toFixed(3), // Quote Amount
                '', // Fee Currency
                '', // Fee Amount
                '', // From
                '', // To
                'Hive', // Blockchain
                txHash, // ID
                `Hive on-chain market trade ${currentOwner} ${currentPaysStr} ${currentPaysAssetName} to ${openOwner} ${openPaysStr} ${openPaysAssetName}`, // Description
                currentPaysAssetName === 'HIVE'
                  ? usdPriceHive.toFixed(2)
                  : usdPriceHbd.toFixed(2), // Reference Price Per Unit
                'USD', // Reference Price Currency
              ])
            }
            break
          }
          default:
            break
        }
      })

      // If we've reached the end of the date range, stop
      if (
        result.length < 1000 ||
        dayjs(result[0][1].timestamp).isBefore(startDate, 'day')
      ) {
        finishedLooping = true
      }

      // Set the from to the last transaction we got
      currentFrom = result[0][0]
      page++
    }

    setOutput((output) => `${output}Exporting CSV...\n`)

    // Convert the CSV array to a string.
    // We wrap the columns in quotes to prevent commas in the memo field from breaking the CSV
    const csvContent = csv
      .map((line) => line.map((col) => `"${col}"`).join(','))
      .join('\n')

    // Download the CSV file
    const element = document.createElement('a')
    element.href = `data:text/csv;charset=utf-8,${encodeURI(csvContent)}`
    element.target = '_blank'
    element.download = `hive-wallet-export-${username}-${start}-${end}.csv`
    element.click()

    setOutput((output) => `${output}Exporting Complete.\n`)
    setLoading(false)
  }

  return (
    <Layout>
      <Header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: colorBgContainer,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Logo
            style={{
              height: '32px',
              width: '32px',
              marginRight: '10px',
            }}
          />
          Hive Wallet Export
        </div>
        <Switch
          checked={darkMode}
          checkedChildren="🌙"
          unCheckedChildren="🔆"
          onChange={() => {
            localStorage.setItem('theme', darkMode ? 'light' : 'dark')
            setDarkMode(!darkMode)
          }}
        />
      </Header>
      <Content>
        <Card
          title="Export"
          style={{
            width: '30%',
            margin: 'auto',
            marginTop: '20px',
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              dateRange: defaultDateRange,
              exportType: ExportType.Koinly,
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={16}>
                <Form.Item
                  label="HIVE Username"
                  name="username"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Enter your HIVE username" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label="Export Date Range"
                  name="dateRange"
                  rules={[{ required: true }]}
                >
                  <RangePicker />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label=" ">
                  <Space>
                    <Button
                      color={
                        dateRangeValue && dateRangeValue === defaultDateRange
                          ? 'primary'
                          : 'default'
                      }
                      onClick={setLastMonth}
                    >
                      Last Month
                    </Button>
                    <Button
                      color={
                        form.getFieldValue('dateRange') === auFy
                          ? 'primary'
                          : 'default'
                      }
                      onClick={setAuFy}
                    >
                      AU FY
                    </Button>
                    <Button onClick={setUsFy}>US FY</Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label="Export Type"
                  name="exportType"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Select.Option value={ExportType.Koinly}>
                      Koinly
                    </Select.Option>
                    <Select.Option value={ExportType.CryptoTaxCalculator}>
                      CryptoTaxCalculator
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Export
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>

          <Card style={{ marginTop: 16 }} type="inner" title="Output">
            <pre
              ref={outputConsole}
              style={{
                maxHeight: 150,
              }}
            >
              {output}
            </pre>
          </Card>
        </Card>
      </Content>
    </Layout>
  )
}

export default HomePage
