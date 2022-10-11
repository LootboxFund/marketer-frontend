import { AdvertiserID, ConquestStatus } from '@wormgraph/helpers';
import moment from 'moment';
import type { Moment } from 'moment';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, Modal, Upload } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { UpdateAdvertiserDetailsPayload } from '@/api/graphql/generated/types';
import { AntUploadFile } from '../AntFormBuilder';
import { AdvertiserStorageFolder } from '@/api/firebase/storage';
import { $Horizontal } from '@/components/generics';

export type EditAdvertiserFormProps = {
  advertiser: {
    id: AdvertiserID;
    name: string;
    description?: string;
    avatar?: string;
    publicContactEmail?: string;
    website?: string;
  };
  onSubmit: (payload: UpdateAdvertiserDetailsPayload) => void;
  mode: 'view-edit' | 'view-only';
};

const ADVERTISER_INFO = {
  id: '',
  name: '',
  description: '',
  avatar: '',
  publicContactEmail: '',
  website: '',
};

const EditAdvertiserForm: React.FC<EditAdvertiserFormProps> = ({ advertiser, onSubmit, mode }) => {
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState(true);
  const [pending, setPending] = useState(false);
  const newMediaDestination = useRef('');
  const [advertiserInfo, setAdvertiserInfo] = useState(ADVERTISER_INFO);
  useEffect(() => {
    setAdvertiserInfo({
      id: advertiser.id,
      name: advertiser.name,
      description: advertiser.description || '',
      avatar: advertiser.avatar || '',
      publicContactEmail: advertiser.publicContactEmail || '',
      website: advertiser.website || '',
    });
  }, [advertiser]);
  const handleFinish = useCallback(async (values) => {
    const payload = {} as Omit<UpdateAdvertiserDetailsPayload, 'id'>;
    if (values.name) {
      payload.name = values.name;
    }
    if (values.description) {
      payload.description = values.description;
    }
    if (newMediaDestination.current) {
      payload.avatar = newMediaDestination.current;
    }
    if (values.publicContactEmail) {
      payload.publicContactEmail = values.publicContactEmail;
    }
    if (values.website) {
      payload.website = values.website;
    }
    setPending(true);
    try {
      await onSubmit(payload);
      setPending(false);
      setViewMode(true);
      Modal.success({
        title: 'Success',
        content: 'Profile Details updated',
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
      columns: 1,
      disabled: pending,
      initialValues: advertiserInfo,
      fields: [
        {
          key: 'name',
          label: 'Name',
          required: true,
          tooltip: 'Your public name that will appear in the marketplace for partners to see.',
        },
        {
          key: 'publicContactEmail',
          label: 'Public Contact Email',
          tooltip:
            'Your private contact email that will only be visible to your chosen partners. It will NOT be visible on the public marketplace.',
        },
        {
          key: 'description',
          label: 'Description',
          widget: 'textarea',
          tooltip:
            'A public description of your company and what you are looking for in partners. It will be visible on the public marketplace.',
        },
        {
          key: 'website',
          label: 'Website',
          tooltip:
            'A public link to your website or soials. We recommend you use a LinkTree or LinkInBio page so that you can list many sites.',
        },
      ],
    };
    if (!viewMode) {
      meta.fields.push({
        key: 'image',
        label: 'Image',
        // @ts-ignore
        widget: () => (
          <AntUploadFile
            advertiserID={advertiser.id}
            folderName={AdvertiserStorageFolder.AVATAR}
            newMediaDestination={newMediaDestination}
            acceptedFileTypes={'image/*'}
          />
        ),
        tooltip: 'A public thumbnail of your company logo.',
      });
    }
    if (viewMode) {
      meta.fields.push({
        key: 'id',
        label: 'Advertiser ID',
        tooltip: 'Your Advertiser ID in case anyone asks you for it.',
      });
    }
    return meta;
  };
  return (
    <Card style={{ flex: 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {viewMode && (
          <Button type="link" onClick={() => setViewMode(false)} style={{ alignSelf: 'flex-end' }}>
            Edit
          </Button>
        )}
        <Form layout="horizontal" form={form} onFinish={handleFinish}>
          <FormBuilder form={form} meta={getMeta()} viewMode={viewMode} />
          {!viewMode && (
            <Form.Item className="form-footer">
              <$Horizontal justifyContent="flex-end" style={{ width: '100%' }}>
                <Button
                  onClick={() => {
                    form.resetFields();
                    setViewMode(true);
                  }}
                  style={{ marginRight: '10px' }}
                >
                  Cancel
                </Button>
                <Button htmlType="submit" type="primary" disabled={pending}>
                  {pending ? 'Updating...' : 'Update'}
                </Button>
              </$Horizontal>
            </Form.Item>
          )}
        </Form>
      </div>
    </Card>
  );
};

export default EditAdvertiserForm;
