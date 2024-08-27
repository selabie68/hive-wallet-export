import { useState } from 'react'

import { Form, Row, Col, Checkbox, FormInstance } from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { CheckboxOptionType } from 'antd/es/checkbox/Group'

interface HiveTransactionsProps {
  form: FormInstance
  formItemName: string
  transactionOptions: { label: string; value: number | string }[]
}

function HiveTransactions({
  form,
  formItemName,
  transactionOptions,
}: HiveTransactionsProps) {
  const [checkAll, setCheckAll] = useState<boolean>(true)
  const [indeterminate, setIndeterminate] = useState<boolean>(false)

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    form.setFieldsValue({
      [formItemName]: e.target.checked
        ? transactionOptions.map((t) => t.value)
        : [],
    })

    setCheckAll(e.target.checked)
  }

  const onTransactionsChange = (checkedValues: CheckboxOptionType[]) => {
    setIndeterminate(
      !!checkedValues.length &&
        checkedValues.length < transactionOptions.length,
    )
    setCheckAll(checkedValues.length === transactionOptions.length)
  }

  return (
    <Form.Item
      name={formItemName}
      labelCol={{
        span: 24,
        style: {
          width: '100%',
        },
      }}
      label={
        <Row style={{ width: '100%' }}>
          <Col span={12}>Transactions to Export</Col>
          <Col
            span={12}
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Checkbox
              indeterminate={indeterminate}
              onChange={onCheckAllChange}
              checked={checkAll}
            >
              Check all
            </Checkbox>
          </Col>
        </Row>
      }
    >
      <Checkbox.Group onChange={onTransactionsChange}>
        <Row>
          {transactionOptions.map((option) => (
            <Col key={option.value} span={8}>
              <Checkbox value={option.value} style={{ lineHeight: '32px' }}>
                {option.label}
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
    </Form.Item>
  )
}

export default HiveTransactions
