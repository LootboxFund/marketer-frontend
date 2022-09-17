import {
  AdvertiserID,
  ConquestStatus,
  MeasurementPartnerType,
  OfferStatus,
} from '@wormgraph/helpers';
import moment from 'moment';
import type { Moment } from 'moment';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, Modal } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import type { CreateOfferPayload, EditOfferPayload } from '@/api/graphql/generated/types';
import { PriceInput, PriceView } from '../CurrencyInput';
import { Rule } from 'antd/lib/form';

const advertiserID = 'p7BpSqP6U4n4NEanEcFt';

export type CreateOfferFormProps = {
  offer?: {
    title: string;
    description?: string;
    image?: string;
    advertiserID?: AdvertiserID;
    maxBudget: number;
    startDate: number;
    endDate: number;
    status: OfferStatus;
    affiliateBaseLink?: string;
    mmp?: MeasurementPartnerType;
  };
  onSubmit: (payload: Omit<EditOfferPayload, 'id'> | CreateOfferPayload) => void;
  mode: 'create' | 'edit-only' | 'view-edit' | 'view-only';
};

const OFFER_INFO = {
  title: '',
  description: '',
  image: '',
  advertiserID: '',
  maxBudget: 1000,
  startDate: moment(new Date()),
  endDate: moment(new Date()).add(365, 'days'),
  status: OfferStatus.Active,
  affiliateBaseLink: '',
  mmp: MeasurementPartnerType.Manual,
};
const DateView = ({ value }: { value: Moment }) => value.format('MMM Do YYYY');

const CreateOfferForm: React.FC<CreateOfferFormProps> = ({ offer, onSubmit, mode }) => {
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState(true);
  const [pending, setPending] = useState(false);
  const [offerInfo, setOfferInfo] = useState(OFFER_INFO);
  const lockedToEdit = mode === 'create' || mode === 'edit-only';
  useEffect(() => {
    if (lockedToEdit) {
      setViewMode(false);
    }
  }, []);
  useEffect(() => {
    if (offer) {
      setOfferInfo({
        title: offer.title,
        description: offer.description || '',
        image: offer.image || '',
        advertiserID: advertiserID,
        maxBudget: offer.maxBudget || 1000,
        startDate: moment.unix(offer.startDate),
        endDate: moment.unix(offer.endDate),
        status: offer.status || OfferStatus.Active,
        affiliateBaseLink: offer.affiliateBaseLink || '',
        mmp: offer.mmp || MeasurementPartnerType.Manual,
      });
    }
  }, [offer]);
  const handleFinish = useCallback(async (values) => {
    console.log('Submit: ', values);
    type OfferFormPayloadFE = CreateOfferPayload | Omit<EditOfferPayload, 'id'>;
    const payload = {} as OfferFormPayloadFE;
    if (values.title) {
      payload.title = values.title;
    }
    if (values.description) {
      payload.description = values.description;
    }
    if (values.status) {
      payload.status = values.status;
    }
    if (values.maxBudget) {
      payload.maxBudget = values.maxBudget.price;
    }
    if (values.affiliateBaseLink) {
      // @ts-ignore
      payload.affiliateBaseLink = values.affiliateBaseLink;
    }
    if (values.mmp) {
      // @ts-ignore
      payload.mmp = values.mmp;
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
      if (!lockedToEdit) {
        setViewMode(true);
      }
      Modal.success({
        title: 'Success',
        content: mode === 'create' ? 'Offer created' : 'Offer updated',
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
      initialValues: offerInfo,
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
          key: 'maxBudget',
          label: 'Max Budget',
          widget: PriceInput,
          viewWidget: PriceView,
          initialValue: {
            price: mode === 'create' ? 1000 : offer?.maxBudget || 1000,
            currency: 'USDC Polygon',
          },
        },
        {
          key: 'affiliateBaseLink',
          label: 'Affiliate Link',
          required: mode === 'create' ? true : false,
          rules: [
            { required: true } as Rule,
            { type: 'url' } as Rule,
            { type: 'string', min: 3 } as Rule,
          ],
        },
        {
          key: 'status',
          label: 'Status',
          widget: 'radio-group',
          options: [
            OfferStatus.Active,
            OfferStatus.Inactive,
            OfferStatus.Planned,
            OfferStatus.Archived,
          ],
        },
        {
          key: 'mmp',
          label: 'Measurement Partner',
          widget: 'select',
          options: [
            MeasurementPartnerType.Appsflyer,
            MeasurementPartnerType.LootboxPixel,
            MeasurementPartnerType.Manual,
          ],
        },
      ],
    };
    return meta;
  };
  return (
    <Card style={{ flex: 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {viewMode && !lockedToEdit && (
          <Button type="link" onClick={() => setViewMode(false)} style={{ alignSelf: 'flex-end' }}>
            Edit
          </Button>
        )}
        <Form layout="horizontal" form={form} onFinish={handleFinish}>
          <FormBuilder form={form} meta={getMeta()} viewMode={viewMode} />
          {!viewMode && (
            <Form.Item className="form-footer" wrapperCol={{ span: 16, offset: 4 }}>
              {mode === 'create' ? (
                <Button htmlType="submit" type="primary" disabled={pending}>
                  {pending ? 'Creating...' : 'Create'}
                </Button>
              ) : (
                <Button htmlType="submit" type="primary" disabled={pending}>
                  {pending ? 'Updating...' : 'Update'}
                </Button>
              )}

              <Button
                onClick={() => {
                  form.resetFields();
                  if (!lockedToEdit) {
                    setViewMode(true);
                  }
                  if (mode === 'create') {
                    history.back();
                  }
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

export default CreateOfferForm;