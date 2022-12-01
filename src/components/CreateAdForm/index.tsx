import {
  AdID,
  AdvertiserID,
  AspectRatio,
  MeasurementPartnerType,
  OfferStatus,
} from '@wormgraph/helpers';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, Image, Modal } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Ad,
  AdStatus,
  CreateAdPayload,
  CreativeType,
  EditAdPayload,
  OfferPreview,
  Placement,
} from '@/api/graphql/generated/types';
import { AntColorPicker, AntUploadFile, PriceInput, PriceView } from '../AntFormBuilder';
import { Rule } from 'antd/lib/form';
import { DateView } from '../AntFormBuilder';
import { AdvertiserStorageFolder } from '@/api/firebase/storage';
import { $Horizontal, $ColumnGap, placeholderVideoThumbnail } from '@/components/generics';
import DeviceSimulator from '../DeviceSimulator';
import { placeholderGif, placeholderVideo } from '../generics';

export enum AdSampleCallToActions {
  'Custom' = 'Custom',
  'Sign Up' = 'Sign Up',
  'Download Game' = 'Download Game',
  'Join Community' = 'Join Community',
  'Start Free Trial' = 'Start Free Trial',
  'Claim Gift' = 'Claim Gift',
  'Pre-Register' = 'Pre-Register',
  'Follow Socials' = 'Follow Socials',
  'Shop Now' = 'Shop Now',
  'Visit Website' = 'Visit Website',
  'Subscribe' = 'Subscribe',
  'Donate Now' = 'Donate Now',
  'RSVP Event' = 'RSVP Event',
  'Learn More' = 'Learn More',
  'Join Whitelist' = 'Join Whitelist',
  'Download App' = 'Download App',
  'Book Now' = 'Book Now',
  'Get Offer' = 'Get Offer',
  'Get Quote' = 'Get Quote',
  'Get Directions' = 'Get Directions',
  'Contact Us' = 'Contact Us',
  'Play Game' = 'Play Game',
  'Listen Now' = 'Listen Now',
  'Read More' = 'Read More',
  'Buy Now' = 'Buy Now',
  'Download' = 'Download',
  'Install Now' = 'Install Now',
  'Use App' = 'Use App',
  'Watch Now' = 'Watch Now',
}

export type CreateAdFormProps = {
  ad?: {
    id?: string;
    advertiserID: AdvertiserID;
    name: string;
    description: string;
    status: AdStatus;
    placement: Placement;
    publicInfo: string;
    creative: {
      creativeType: CreativeType;
      creativeLinks: string[];
      callToAction: AdSampleCallToActions;
      thumbnail: string;
      infographicLink?: string;
      aspectRatio: AspectRatio;
      themeColor: string;
    };
  };
  advertiserID: AdvertiserID;
  onSubmitCreate?: (payload: CreateAdPayload) => void;
  onSubmitEdit?: (payload: EditAdPayload) => void;
  mode: 'create' | 'edit-only' | 'view-edit' | 'view-only';
};

const AD_INFO = {
  id: '',
  advertiserID: '',
  name: '',
  description: '',
  status: AdStatus.Active,
  publicInfo: '',
  placement: Placement.AfterTicketClaim,
  creative: {
    creativeType: CreativeType.Image,
    creativeLinks: [placeholderGif, placeholderVideo],
    callToAction: AdSampleCallToActions['Download Game'],
    thumbnail: '',
    infographicLink: '',
    aspectRatio: AspectRatio.Portrait2x3,
    themeColor: '#000000',
  },
};
const CreateAdForm: React.FC<CreateAdFormProps> = ({
  ad,
  onSubmitCreate,
  onSubmitEdit,
  mode,
  advertiserID,
}) => {
  const newMediaDestination = useRef('');
  const newThemeColor = useRef<string>();
  const [previewMedias, setPreviewMedias] = useState<string[]>([]);
  const [form] = Form.useForm();
  // @ts-ignore
  const forceUpdate = FormBuilder.useForceUpdate();
  const [viewMode, setViewMode] = useState(true);
  const [pending, setPending] = useState(false);
  const [adInfo, setAdInfo] = useState(AD_INFO);
  const lockedToEdit = mode === 'create' || mode === 'edit-only';
  useEffect(() => {
    if (lockedToEdit) {
      setViewMode(false);
    }
  }, []);

  useEffect(() => {
    if (ad && mode !== 'create') {
      setAdInfo({
        id: ad.id as AdID,
        advertiserID: ad.advertiserID,
        name: ad.name,
        description: ad.description,
        status: ad.status,
        placement: ad.placement,
        publicInfo: ad.publicInfo,
        creative: {
          creativeType: ad.creative.creativeType,
          creativeLinks: ad.creative.creativeLinks,
          callToAction: ad.creative.callToAction as AdSampleCallToActions,
          thumbnail: ad.creative.thumbnail,
          infographicLink: ad.creative.infographicLink || '',
          aspectRatio: ad.creative.aspectRatio,
          themeColor: ad.creative.themeColor,
        },
      });
    }
  }, [ad]);
  const handleCreateFinish = useCallback(async (values) => {
    if (!onSubmitCreate) return;

    const payload = {
      creative: {},
    } as CreateAdPayload;
    if (values.name) {
      payload.name = values.name;
    }
    if (values.description) {
      payload.description = values.description;
    }
    if (values.status) {
      payload.status = values.status;
    }
    if (values.placement) {
      payload.placement = values.placement;
    }
    if (values.publicInfo) {
      payload.publicInfo = values.publicInfo;
    }
    if (values.creative_creativeType) {
      payload.creative.creativeType = values.creative_creativeType;
    }
    if (values.creative_creativeLinks) {
      payload.creative.creativeLinks = values.creative_creativeLinks;
    }
    if (values.creative_callToAction) {
      payload.creative.callToAction = values.customCTA || values.creative_callToAction;
    }
    if (values.creative_aspectRatio) {
      payload.creative.aspectRatio = values.creative_aspectRatio;
    }
    // if (payload.creative && adInfo.creative.themeColor) {
    //   payload.creative.themeColor = adInfo.creative.themeColor;
    // }
    if (payload.creative && newThemeColor.current) {
      payload.creative.themeColor = newThemeColor.current;
    }
    if (newMediaDestination.current) {
      const mp4_version = newMediaDestination.current;
      const x = newMediaDestination.current.split('.');
      x.pop();
      const filePathWithoutExtension = x.join('.');
      const webm_version = `${filePathWithoutExtension}.webm?alt=media`;
      const thumbnail_version = `${filePathWithoutExtension}.jpeg?alt=media`;
      payload.creative.creativeLinks =
        values.creative_creativeType === CreativeType.Video
          ? [mp4_version, webm_version]
          : [newMediaDestination.current];
      payload.creative.thumbnail =
        values.creative_creativeType === CreativeType.Video
          ? thumbnail_version
          : newMediaDestination.current;
    }
    payload.advertiserID = advertiserID;
    setPending(true);
    try {
      await onSubmitCreate(payload);
      setPending(false);
      if (!lockedToEdit) {
        setViewMode(true);
      }
      Modal.success({
        title: 'Success',
        content: mode === 'create' ? 'Offer created' : 'Offer updated',
      });
      setPending(false);
    } catch (e: any) {
      Modal.error({
        title: 'Failure',
        content: `${e.message}`,
      });
      setPending(false);
    }
  }, []);
  const handleEditFinish = useCallback(async (values) => {
    console.log(`values = `, values);
    console.log(`adInfo = `, adInfo);
    console.log(`newThemeColor = `, newThemeColor.current);
    console.log(`newMediaDestination = `, newMediaDestination.current);
    if (!onSubmitEdit) return;
    const payload = {
      creative: {},
    } as EditAdPayload;
    if (ad?.id) {
      payload.name = values.name;
    }
    if (values.name) {
      payload.name = values.name;
    }
    if (values.description) {
      payload.description = values.description;
    }
    if (values.status) {
      payload.status = values.status;
    }
    if (values.placement) {
      payload.placement = values.placement;
    }
    if (values.publicInfo) {
      payload.publicInfo = values.publicInfo;
    }
    if (payload.creative && values.creative_creativeType) {
      payload.creative.creativeType = values.creative_creativeType;
    }
    if (payload.creative && values.creative_creativeLinks) {
      payload.creative.creativeLinks = values.creative_creativeLinks;
    }
    if (payload.creative && values.creative_callToAction) {
      payload.creative.callToAction = values.customCTA || values.creative_callToAction;
    }
    if (payload.creative && values.creative_aspectRatio) {
      payload.creative.aspectRatio = values.creative_aspectRatio;
    }
    // if (payload.creative && adInfo.creative.themeColor) {
    //   payload.creative.themeColor = adInfo.creative.themeColor;
    // }
    if (payload.creative && newThemeColor.current) {
      payload.creative.themeColor = newThemeColor.current;
    }
    if (payload.creative && newMediaDestination.current) {
      const mp4_version = newMediaDestination.current;
      const x = newMediaDestination.current.split('.');
      x.pop();
      const filePathWithoutExtension = x.join('.');
      const webm_version = `${filePathWithoutExtension}.webm?alt=media`;
      const thumbnail_version = `${filePathWithoutExtension}.jpeg?alt=media`;
      payload.creative.creativeLinks =
        values.creative_creativeType === CreativeType.Video
          ? [mp4_version, webm_version]
          : [newMediaDestination.current];
      payload.creative.thumbnail =
        values.creative_creativeType === CreativeType.Video
          ? thumbnail_version
          : newMediaDestination.current;
    }
    setPending(true);
    try {
      await onSubmitEdit(payload);
      setPending(false);
      if (!lockedToEdit) {
        setViewMode(true);
      }
      Modal.success({
        title: 'Success',
        content: 'Offer updated',
      });
      setPending(false);
    } catch (e: any) {
      Modal.error({
        title: 'Failure',
        content: `${e.message}`,
      });
      setPending(false);
    }
  }, []);

  const meta1 = () => {
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: adInfo,
      fields: [
        {
          key: 'placement',
          label: 'Placement',
          widget: 'select',
          tooltip:
            'This determines where your ad is shown. See the tutorial linked above for a list of placements and how each one works.',
          required: true,
          initialValue: adInfo.placement,
          options: [Placement.AfterTicketClaim, Placement.Airdrop],
        },
        {
          key: 'creative_aspectRatio',
          label: 'Aspect Ratio',
          widget: 'select',
          required: true,
          initialValue: adInfo.creative.aspectRatio,
          options: [
            AspectRatio.Portrait9x16,
            AspectRatio.Portrait2x3,
            AspectRatio.Tablet4x5,
            AspectRatio.Square1x1,
            AspectRatio.Landscape16x9,
          ],
          tooltip:
            'This determines how the ad will be shown on devices. The optimal is Portrait2x3 as it can show on all devices',
        },
        {
          key: 'creative_creativeType',
          label: 'Media Type',
          widget: 'select',
          required: true,
          initialValue: adInfo.creative.creativeType,
          // @ts-ignore
          options: [CreativeType.Image, CreativeType.Video],
          tooltip:
            'Choose between image or video. Note that you can upload GIFs too, which count as image.',
        },
      ],
    };

    if (!viewMode) {
      meta.fields.push({
        key: 'creative_thumbnail',
        label: 'Media',
        rules: [
          {
            validator: (rule: any, value: any, callback: any) => {
              // Do async validation to check if username already exists
              // Use setTimeout to emulate api call
              return new Promise((resolve, reject) => {
                if (mode === 'create' && !newMediaDestination.current) {
                  reject(new Error(`Upload a file`));
                } else {
                  resolve(newMediaDestination.current);
                }
              });
            },
          },
        ],
        // @ts-ignore
        widget: () => (
          <AntUploadFile
            advertiserID={advertiserID}
            folderName={AdvertiserStorageFolder.AD_VIDEO}
            newMediaDestination={newMediaDestination}
            notificationDuration={null}
            forceRefresh={() => setPreviewMedias([newMediaDestination.current])}
            acceptedFileTypes={
              form.getFieldValue('creative_creativeType') === CreativeType.Video
                ? 'video/mp4'
                : 'image/*'
            }
          />
        ),
        tooltip:
          'Upload the image or video for your ad. Please keep it under 5MB for images and 100MB for videos. We will automatically compress & transcode media to optimize for the right device delivery.',
      });
    }
    return meta;
  };
  const meta2 = () => {
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: adInfo,
      fields: [
        { key: 'publicInfo', label: 'Public Info', widget: 'textarea' },
        {
          key: 'creative_callToAction',
          label: 'Call To Action',
          widget: 'select',
          required: true,
          initialValue: adInfo.creative.callToAction,
          options: Object.keys(AdSampleCallToActions),
          tooltip:
            "The text that appears on the ad's button. Your call to action should match the ad media and your offer.",
        },
      ],
    };

    if (form.getFieldValue('creative_callToAction') === AdSampleCallToActions.Custom) {
      // @ts-ignore
      meta.fields.push({
        key: 'customCTA',
        label: 'Custom CTA',
        tooltip:
          'Specify a custom call to action. Note that this may result in longer review times before your ad can be shown to the public.',
      });
    }

    meta.fields.push({
      key: 'destination',
      label: 'Landing Page URL',
      // @ts-ignore
      widget: () => (
        <input value="Set By Offer" disabled style={{ width: '100%', color: 'gray' }} />
      ),
      viewWidget: () => <i style={{ color: 'gray' }}>{'Set By Offer'}</i>,
      tooltip:
        "Where users will be taken when they click on your ad's call to action button. This is automatically set by the Offer.",
    });
    meta.fields.push({
      key: 'creative_themeColor',
      label: 'Theme Color',
      // @ts-ignore
      viewWidget: () => <span>{adInfo.creative.themeColor}</span>,
      // @ts-ignore
      widget: () => (
        <AntColorPicker
          initialColor={adInfo.creative.themeColor}
          updateColor={(hex: string) => {
            console.log('setting color...');
            newThemeColor.current = hex;
            setAdInfo({
              ...adInfo,
              creative: {
                ...adInfo.creative,
                themeColor: hex,
              },
            });
          }}
        />
      ),
      tooltip: "The color of your ad's call to action button and other accent colors.",
    });
    return meta;
  };
  const meta3 = () => {
    return {
      columns: 1,
      disabled: pending,
      initialValues: adInfo,
      fields: [
        {
          key: 'name',
          label: 'Name',
          required: true,
          tooltip: 'Only visible to your internal name for easy reference.',
        },
        {
          key: 'status',
          label: 'Status',
          required: true,
          widget: 'radio-group',
          options: [AdStatus.Active, AdStatus.Inactive, AdStatus.Planned, AdStatus.Archived],
          tooltip: 'Only Active Ads can be shown to users',
        },
        {
          key: 'description',
          label: 'Private Notes',
          widget: 'textarea',
          tooltip:
            'Only visible to your team to describe how to best use this ad and who to speak to for more details.',
        },
      ],
    };
  };
  return (
    <Card style={{ flex: 1 }}>
      <$Horizontal justifyContent="flex-start">
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
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
            layout="horizontal"
            form={form}
            onFinish={mode === 'create' ? handleCreateFinish : handleEditFinish}
            onValuesChange={forceUpdate}
          >
            <fieldset>
              <legend>{`Media Upload`}</legend>
              <FormBuilder form={form} meta={meta1()} viewMode={viewMode} />
            </fieldset>
            <fieldset>
              <legend>{`Public Details`}</legend>
              <FormBuilder form={form} meta={meta2()} viewMode={viewMode} />
            </fieldset>
            <fieldset>
              <legend>{`Private Details`}</legend>
              <FormBuilder form={form} meta={meta3()} viewMode={viewMode} />
            </fieldset>
            {!viewMode && (
              <fieldset>
                <legend>{`Submit`}</legend>
                <$Horizontal justifyContent="flex-end">
                  <Form.Item className="form-footer" style={{ width: 'auto' }}>
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
                      style={{ marginRight: '15px' }}
                    >
                      Cancel
                    </Button>

                    {mode === 'create' ? (
                      <Button htmlType="submit" type="primary" disabled={pending}>
                        {pending ? 'Creating...' : 'Create'}
                      </Button>
                    ) : (
                      <Button htmlType="submit" type="primary" disabled={pending}>
                        {pending ? 'Updating...' : 'Update'}
                      </Button>
                    )}
                  </Form.Item>
                </$Horizontal>
              </fieldset>
            )}
          </Form>
        </div>
        <$ColumnGap width="50px" />
        <DeviceSimulator
          creative={{
            themeColor: newThemeColor.current ? newThemeColor.current : adInfo.creative.themeColor,
            callToAction:
              form.getFieldValue('creative_callToAction') === AdSampleCallToActions.Custom
                ? form.getFieldValue('customCTA') || adInfo.creative.callToAction
                : form.getFieldValue('creative_callToAction') || adInfo.creative.callToAction,
            creativeType:
              form.getFieldValue('creative_creativeType') || adInfo.creative.creativeType,
            creativeLinks: newMediaDestination.current
              ? [newMediaDestination.current]
              : adInfo.creative.creativeLinks,
            aspectRatio: form.getFieldValue('creative_aspectRatio') || adInfo.creative.aspectRatio,
          }}
        />
      </$Horizontal>
    </Card>
  );
};

export default CreateAdForm;
