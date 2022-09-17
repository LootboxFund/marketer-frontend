import { Col, InputNumber, Row, Select } from 'antd';

export const PriceInput = ({ value, onChange }: { value: any; onChange: any }) =>
  value ? (
    <Row gutter={10}>
      <Col span={12}>
        <InputNumber
          style={{ width: '100%' }}
          value={value.price}
          min={0}
          onChange={(v) => onChange({ price: v, currency: value.currency })}
          formatter={(value) => `$ ${value}`}
        />
      </Col>
      <Col span={12}>
        <Select
          value={value.currency}
          onChange={(v) => onChange({ price: value.price, currency: v })}
        >
          <Select.Option value="USDC_Polygon">USDC Polygon</Select.Option>
        </Select>
      </Col>
    </Row>
  ) : null;

export const PriceView = ({ value }: { value: any }) => {
  return (
    <span>
      ${value.price} {value.currency}
    </span>
  );
};
