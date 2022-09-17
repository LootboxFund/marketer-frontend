import { ConquestStatus } from '@wormgraph/helpers';
import moment from 'moment';
import type { Moment } from 'moment';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, Input, Modal } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import type { UpdateConquestPayload } from '@/api/graphql/generated/types';

export type CreateCampaignFormProps = {
  conquest?: {
    title: string;
    description: string;
    status: ConquestStatus;
    startDate: number;
    endDate: number;
  };
  onSubmit: (payload: Omit<UpdateConquestPayload, 'id'>) => void;
};

const CONQUEST_INFO = {
  title: '',
  description: '',
  startDate: moment(new Date()),
  endDate: moment(new Date()),
  status: ConquestStatus.Planned,
};
const DateView = ({ value }: { value: Moment }) => value.format('MMM Do YYYY');

const CreateCampaignForm: React.FC<CreateCampaignFormProps> = ({ conquest, onSubmit }) => {
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState(true);
  const [pending, setPending] = useState(false);
  const [conquestInfo, setConquestInfo] = useState(CONQUEST_INFO);
  useEffect(() => {
    if (conquest) {
      setConquestInfo({
        title: conquest.title,
        description: conquest.description,
        startDate: moment.unix(conquest.startDate),
        endDate: moment.unix(conquest.endDate),
        status: conquest.status,
      });
    }
  }, [conquest]);
  const handleFinish = useCallback(async (values) => {
    console.log('Submit: ', values);
    const payload = {} as Omit<UpdateConquestPayload, 'id'>;
    if (values.title) {
      payload.title = values.title;
    }
    if (values.description) {
      payload.description = values.description;
    }
    if (values.status) {
      payload.status = values.status;
    }
    if (values.startDate) {
      payload.startDate = values.startDate.unix();
    }
    if (values.endDate) {
      payload.endDate = values.endDate.unix();
    }
    setPending(true);
    try {
      await onSubmit(payload);
      setPending(false);
      setViewMode(true);
      Modal.success({
        title: 'Success',
        content: 'Campaign details updated.',
      });
    } catch (e: any) {
      Modal.error({
        title: 'Failure',
        content: `${e.message}`,
      });
    }
  }, []);
  const getMeta = () => {
    const meta = {
      columns: 2,
      disabled: pending,
      initialValues: conquestInfo,
      fields: [
        { key: 'title', label: 'Title', required: true },
        {
          key: 'startDate',
          label: 'Start Date',
          widget: 'date-picker',
          viewWidget: DateView,
        },
        { key: 'description', label: 'Description', widget: 'textarea' },
        {
          key: 'endDate',
          label: 'End Date',
          widget: 'date-picker',
          viewWidget: DateView,
        },
        {
          key: 'status',
          label: 'Status',
          widget: 'radio-group',
          options: [
            ConquestStatus.Active,
            ConquestStatus.Inactive,
            ConquestStatus.Planned,
            ConquestStatus.Archived,
          ],
        },
      ],
    };
    return meta;
  };
  return (
    <Card style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {viewMode && (
          <Button type="link" onClick={() => setViewMode(false)} style={{ alignSelf: 'flex-end' }}>
            Edit
          </Button>
        )}
        <Form layout="horizontal" form={form} onFinish={handleFinish}>
          <FormBuilder form={form} meta={getMeta()} viewMode={viewMode} />
          {!viewMode && (
            <Form.Item className="form-footer" wrapperCol={{ span: 16, offset: 4 }}>
              <Button htmlType="submit" type="primary" disabled={pending}>
                {pending ? 'Updating...' : 'Update'}
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  setViewMode(true);
                }}
                style={{ marginLeft: '15px' }}
              >
                Cancel
              </Button>
            </Form.Item>
          )}
        </Form>
      </div>
    </Card>
  );
};

export default CreateCampaignForm;
