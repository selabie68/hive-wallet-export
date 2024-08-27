import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Layout,
  Row,
  Select,
  Space,
  Switch,
  Statistic,
  theme,
} from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as dhive from '@hiveio/dhive'
import { useQuery } from '@tanstack/react-query'

import isBetween from 'dayjs/plugin/isBetween'
import utc from 'dayjs/plugin/utc'
dayjs.extend(isBetween)
dayjs.extend(utc)

import Logo from '@/assets/logo.svg?react'
import {
  ExportType,
  CryptoTaxCalculatorExport,
  GenericExport,
} from '@/types/ExportType'
import UsernameSelect from '@/components/UsernameSelect'
import HiveTransactions from '@/components/HiveTransactions'
import { balanceImpactingOperations } from '@/utils/balanceImpactingOperations'
import Console from '@/components/Console'
import useFetchAccountHistory from '@/queries/fetchAccountHistory'
import { processTransactions } from '@/utils/processTransactions'

interface UserValue {
  label: string
  value: string
}

const { Header, Content } = Layout
const { RangePicker } = DatePicker

const hive = new dhive.Client([
  'https://api.hive.blog',
  'https://api.hivekings.com',
  'https://anyx.io',
  'https://api.openhive.network',
  'https://hive-api.arcange.eu',
])

const defaultDateRange = [
  dayjs().utc().subtract(1, 'month').startOf('month'),
  dayjs().utc().subtract(1, 'month').endOf('month'),
]

const auFy = [
  dayjs().utc().startOf('year').subtract(6, 'months'),
  dayjs().utc().endOf('year').subtract(6, 'months'),
]

const usFy = [
  dayjs().utc().subtract(1, 'year').startOf('year'),
  dayjs().utc().subtract(1, 'year').endOf('year'),
]

// const hiveEngineTransactionOptions = hiveEngineOperations.map((h) => ({
//   label: (h.charAt(0).toUpperCase() + h.slice(1))
//     .replace(/([A-Z])/g, ' $1')
//     .replace('Nftmarket', 'NFT Market')
//     .replace('Nft', 'NFT')
//     .replace(/_/g, ' - ')
//     .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()),
//   value: h,
// }))

interface FormValues {
  username: UserValue
  dateRange: [dayjs.Dayjs, dayjs.Dayjs]
  exportType: ExportType
  transactionTypes: number[]
  hiveEngineTransactionTypes: string[]
  groupRewards: boolean
  reconcileDay: boolean
  allTime: boolean
}

interface HomePageProps {
  setDarkMode: (darkMode: boolean) => void
  darkMode: boolean
}

function HomePage({ setDarkMode, darkMode }: HomePageProps) {
  const [form] = Form.useForm<FormValues>()
  const [output, setOutput] = useState<string[]>(['Welcome to Hive Exporter!'])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [exportStarted, setExportStarted] = useState<boolean>(false)
  const [exportFinished, setExportFinished] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [totalOperations, setTotalOperations] = useState<number>(0)

  const dateRangeValue = Form.useWatch('dateRange', form)
  const usernameValue = Form.useWatch('username', form)
  const allTimeValue = Form.useWatch('allTime', form)
  const exportType = Form.useWatch('exportType', form)
  const groupRewardsValue = Form.useWatch('groupRewards', form)
  const reconcileDaysValue = Form.useWatch('reconcileDays', form)
  const transactionTypes = Form.useWatch('transactionTypes', form)

  const dateStart = useMemo(
    () =>
      allTimeValue
        ? '1970-01-01T00:00:00'
        : dateRangeValue
          ? dateRangeValue[0].toISOString()
          : dayjs().utc().toISOString(),
    [allTimeValue, dateRangeValue],
  )

  const dateEnd = useMemo(
    () =>
      allTimeValue
        ? dayjs().utc().toISOString()
        : dateRangeValue
          ? dateRangeValue[1].toISOString()
          : dayjs().utc().toISOString(),
    [allTimeValue, dateRangeValue],
  )

  const { isLoading, isError, data, error, isFetching } = useQuery(
    useFetchAccountHistory(
      {
        _account: (usernameValue && usernameValue.value) || '',
        _date_start: dateStart,
        _date_end: dateEnd,
        _body_limit: 100000,
        _page_size: 1000,
        _page_num: page,
        _filter: transactionTypes,
      },
      loading,
    ),
  )

  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const setLastMonth = useCallback(() => {
    form.setFieldsValue({
      dateRange: defaultDateRange,
    })
  }, [form])

  // Set the date range to the last Australian financial year
  const setAuFy = useCallback(() => {
    form.setFieldsValue({
      dateRange: auFy,
    })
  }, [form])

  // Set the date range to the last American financial year
  const setUsFy = useCallback(() => {
    form.setFieldsValue({
      dateRange: usFy,
    })
  }, [form])

  useEffect(() => {
    if (data) {
      if (totalPages === 0) {
        setTotalPages(() => data.total_pages)
        setTotalOperations(() => data.total_operations)

        return
      }

      setTransactions((transactions) => [
        ...transactions,
        ...data.operations_result,
      ])

      if (page >= totalPages) {
        setLoading(false)
        setExportStarted(true)
      } else {
        setPage((page) => page + 1)
      }
    }
  }, [data, totalPages, page])

  useEffect(() => {
    if (
      exportStarted &&
      !exportFinished &&
      !isLoading &&
      !isFetching &&
      transactions.length === totalOperations
    ) {
      processTransactions(
        transactions,
        exportType,
        usernameValue.value,
        groupRewardsValue,
        reconcileDaysValue,
        setOutput,
      )

      setTransactions([])
      setExportStarted(false)
      setExportFinished(true)
    }
  }, [
    exportStarted,
    exportFinished,
    isLoading,
    isFetching,
    transactions,
    exportType,
    usernameValue,
    groupRewardsValue,
    reconcileDaysValue,
    totalOperations,
    setOutput,
  ])

  useEffect(() => {
    if (page && isFetching) {
      setOutput((output) => [...output, `Fetching data for page ${page}...`])
    }
  }, [isFetching, page])

  useEffect(() => {
    if (isError) {
      setOutput((output) => [...output, error.message])
    }
  }, [isError, error])

  const onFinish = () => {
    setExportFinished(false)
    setLoading(true)
  }

  async function fetchUserList(username: string): Promise<UserValue[]> {
    return hive
      .call('condenser_api', 'get_account_reputations', [username, 10])
      .then((results) =>
        results.map(
          (user: { account: string; reputation: number | string }) => ({
            label: user.account,
            value: user.account,
          }),
        ),
      )
  }

  // const collapseItems: CollapseProps['items'] = [
  //   {
  //     key: '1',
  //     label: 'Hive Transaction Types',
  //     forceRender: true,
  //     children: (
  //       <HiveTransactions
  //         form={form}
  //         formItemName="transactionTypes"
  //         transactionOptions={balanceImpactingOperations}
  //       />
  //     ),
  //   },
  //   {
  //     key: '2',
  //     label: 'Hive Engine Transaction Types',
  //     forceRender: true,
  //     children: (
  //       <HiveTransactions
  //         form={form}
  //         formItemName="hiveEngineTransactionTypes"
  //         transactionOptions={hiveEngineTransactionOptions}
  //       />
  //     ),
  //   },
  // ]

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
        <Flex align="center">
          <Logo
            style={{
              height: '32px',
              width: '32px',
              marginRight: '10px',
            }}
          />
          Hive Wallet Export
        </Flex>
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
        <Flex align="center" vertical>
          <Card
            title="Export"
            style={{
              maxWidth: '700px',
              margin: '20px',
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                dateRange: defaultDateRange,
                exportType: ExportType.Generic,
                transactionTypes: balanceImpactingOperations.map(
                  (t) => t.value,
                ),
                // hiveEngineTransactionTypes: hiveEngineTransactionOptions.map(
                //   (t) => t.value,
                // ),
                groupRewards: true,
                allTime: false,
              }}
            >
              <Row gutter={[16, 16]}>
                <Col span={16}>
                  <Form.Item
                    label="HIVE Username"
                    name="username"
                    rules={[{ required: true }]}
                  >
                    <UsernameSelect
                      showSearch
                      placeholder="Select username"
                      fetchOptions={fetchUserList}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={16}>
                  <Form.Item
                    label="Export All"
                    name="allTime"
                    tooltip="If enabled, all transactions will be exported."
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren={<CheckOutlined />}
                      unCheckedChildren={<CloseOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row
                style={{ display: allTimeValue ? 'none' : undefined }}
                gutter={[16, 16]}
              >
                <Col span={12}>
                  <Form.Item
                    label="Export Date Range"
                    name="dateRange"
                    rules={[{ required: true }]}
                  >
                    <RangePicker
                      format={(date) => date.utc().format('YYYY-MM-DD')}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label=" ">
                    <Space>
                      <Button
                        color={
                          dateRangeValue &&
                          JSON.stringify(dateRangeValue) ===
                            JSON.stringify(defaultDateRange)
                            ? 'primary'
                            : 'default'
                        }
                        onClick={setLastMonth}
                      >
                        Last Month
                      </Button>
                      <Button
                        color={
                          dateRangeValue &&
                          JSON.stringify(dateRangeValue) ===
                            JSON.stringify(auFy)
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
                <Col span={24}>
                  <Form.Item
                    label="Group Rewards"
                    name="groupRewards"
                    tooltip="If enabled, reward claims will be grouped between other transactions. This is useful for reducing the number of transactions in your export."
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item
                    label="Reconcile each day"
                    name="reconcileDays"
                    tooltip="If enabled, grouped rewards will be reconciled each day instead of rolling over."
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <HiveTransactions
                    form={form}
                    formItemName="transactionTypes"
                    transactionOptions={balanceImpactingOperations}
                  />
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
                      <Select.Option value={ExportType.Generic}>
                        {new GenericExport().name}
                      </Select.Option>
                      <Select.Option value={ExportType.CryptoTaxCalculator}>
                        {new CryptoTaxCalculatorExport().name}
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
            <Row gutter={[16, 16]}>
              <Col sm={12} lg={8}>
                <Card>
                  <Statistic title="Current Page" value={page} />
                </Card>
              </Col>
              <Col sm={12} lg={8}>
                <Card>
                  <Statistic title="Total Pages" value={totalPages} />
                </Card>
              </Col>
              <Col sm={12} lg={8}>
                <Card>
                  <Statistic
                    title="Current Transactions"
                    value={transactions.length}
                  />
                </Card>
              </Col>
              <Col sm={12} lg={8}>
                <Card>
                  <Statistic
                    title="Total Transactions"
                    value={totalOperations}
                  />
                </Card>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Console style={{ marginTop: 16 }} logs={output} />
              </Col>
            </Row>
          </Card>
        </Flex>
      </Content>
    </Layout>
  )
}

export default HomePage
