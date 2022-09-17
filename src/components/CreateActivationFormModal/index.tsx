import {
  AdvertiserID,
  ConquestStatus,
  MeasurementPartnerType,
  OfferID,
  OfferStatus,
} from '@wormgraph/helpers';
import moment from 'moment';
import type { Moment } from 'moment';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, Modal } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import type {
  CreateActivationInput,
  CreateOfferPayload,
  EditOfferPayload,
} from '@/api/graphql/generated/types';
import { PriceInput, PriceView } from '../CurrencyInput';
import { Rule } from 'antd/lib/form';
import { ActivationStatus } from '../../api/graphql/generated/types';
import type {
  CreateActivationPayload,
  EditActivationPayload,
} from '../../api/graphql/generated/types';

const advertiserID = 'p7BpSqP6U4n4NEanEcFt';

export type CreateActivationFormModalProps = {
  activation?: {
    name: string;
    description?: string;
    pricing: number;
    status: ActivationStatus;
    mmpAlias: string;
    offerID: OfferID;
  };
  mode: 'create' | 'view-edit';
  activationModalVisible: boolean;
  pendingActivationEdit: boolean;
  toggleActivationModal: (visible: boolean) => void;
  offerID: OfferID;
  createActivation: (payload: Omit<CreateActivationInput, 'offerID'>) => void;
};

const ACTIVATION_INFO = {
  name: '',
  description: '',
  pricing: 1,
  status: ActivationStatus.Active,
  mmpAlias: '',
};

const CreateActivationFormModal: React.FC<CreateActivationFormModalProps> = ({
  activation,
  createActivation,
  mode,
  toggleActivationModal,
  pendingActivationEdit,
  activationModalVisible,
}) => {
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState(true);
  const [pending, setPending] = useState(false);
  const [activationInfo, setActivationInfo] = useState(ACTIVATION_INFO);
  const lockedToEdit = mode === 'create';
  useEffect(() => {
    if (lockedToEdit) {
      setViewMode(false);
    }
  }, []);
  useEffect(() => {
    if (activation) {
      setActivationInfo({
        name: activation.name,
        description: activation.description || '',
        pricing: 1,
        status: ActivationStatus.Active,
        mmpAlias: '',
      });
    }
  }, [activation]);
  const handleFinishCreate = useCallback(async (values) => {
    console.log('Submit: ', values);
    const payload = {} as Omit<CreateActivationInput, 'offerID'>;
    if (values.name) {
      payload.name = values.name;
    }
    if (values.description) {
      payload.description = values.description;
    }
    if (values.status) {
      payload.status = values.status;
    }
    if (values.mmpAlias) {
      payload.mmpAlias = values.mmpAlias;
    }
    if (values.pricing) {
      payload.pricing = values.pricing;
    }
    setPending(true);
    try {
      await createActivation(payload);
      setPending(false);
      if (!lockedToEdit) {
        setViewMode(true);
      }
      Modal.success({
        title: 'Success',
        content: mode === 'create' ? 'Activation created' : 'Activation updated',
      });
    } catch (e: any) {
      Modal.error({
        title: 'Failure',
        content: `${e.message}`,
      });
    }
  }, []);
  const handleFinishEdit = useCallback(async (values) => {}, []);
  const getMeta = () => {
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: activationInfo,
      // name: String!
      // description: String
      // pricing: Float!
      // status: ActivationStatus!
      // mmpAlias: String!
      // offerID: ID!
      fields: [
        { key: 'name', label: 'Name', required: true },
        { key: 'description', label: 'Description', widget: 'textarea' },

        {
          key: 'pricing',
          label: 'Pricing',
          widget: PriceInput,
          viewWidget: PriceView,
          initialValue: {
            price: mode === 'create' ? 1 : activation?.pricing || 1,
            currency: 'USDC Polygon',
          },
        },
        {
          key: 'status',
          label: 'Status',
          widget: 'radio-group',
          options: [
            ActivationStatus.Active,
            ActivationStatus.Inactive,
            ActivationStatus.Planned,
            ActivationStatus.Archived,
          ],
        },
        { key: 'mmpAlias', label: 'Measurement ID', required: true },
      ],
    };
    return meta;
  };
  return (
    <Modal
      title="Add Activation Event"
      closable={!pendingActivationEdit}
      maskClosable={!pendingActivationEdit}
      visible={activationModalVisible}
      destroyOnClose
      onOk={() => form.submit()}
      onCancel={() => {
        form.resetFields();
        if (!lockedToEdit) {
          setViewMode(true);
        }
        toggleActivationModal(false);
      }}
      okText={pendingActivationEdit ? 'Loading...' : 'Ok'}
      okButtonProps={{ loading: pendingActivationEdit, disabled: pendingActivationEdit }}
      cancelButtonProps={{ disabled: pendingActivationEdit }}
    >
      <Card style={{ flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {viewMode && !lockedToEdit && (
            <Button
              type="link"
              onClick={() => setViewMode(false)}
              style={{ alignSelf: 'flex-end' }}
            >
              Edit
            </Button>
          )}
          <Form
            layout="vertical"
            form={form}
            onFinish={mode === 'create' ? handleFinishCreate : handleFinishEdit}
          >
            <FormBuilder form={form} meta={getMeta()} viewMode={viewMode} />
            {!viewMode && (
              <Form.Item className="form-footer" wrapperCol={{ span: 16, offset: 4 }}>
                {/* {mode === 'create' ? (
                  <Button htmlType="submit" type="primary" disabled={pending}>
                    {pending ? 'Creating...' : 'Create'}
                  </Button>
                ) : (
                  <Button htmlType="submit" type="primary" disabled={pending}>
                    {pending ? 'Updating...' : 'Update'}
                  </Button>
                )} */}

                {/* <Button
                  onClick={() => {
                    form.resetFields();
                    if (!lockedToEdit) {
                      setViewMode(true);
                    }
                    toggleActivationModal(false);
                  }}
                  style={{ marginLeft: '15px' }}
                >
                  Cancel
                </Button> */}
              </Form.Item>
            )}
          </Form>
        </div>
      </Card>
    </Modal>
  );
};

export default CreateActivationFormModal;
