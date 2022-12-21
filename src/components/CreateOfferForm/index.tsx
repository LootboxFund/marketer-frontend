import {
  AdvertiserID,
  ConquestStatus,
  LootboxID,
  LootboxType,
  MeasurementPartnerType,
  OfferID,
  OfferStatus,
  QuestionAnswerID,
  QuestionFieldType,
  TournamentID,
} from '@wormgraph/helpers';
import moment from 'moment';
import type { Moment } from 'moment';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, message, Modal } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CreateOfferPayload,
  EditOfferPayload,
  MutationCreateLootboxArgs,
  OfferAirdropMetadata,
  OfferPreview,
  OfferStrategyType,
  QuestionAnswerPreview,
} from '@/api/graphql/generated/types';
import { AntUploadFile, PriceInput, PriceView } from '../AntFormBuilder';
import { Rule } from 'antd/lib/form';
import { DateView } from '../AntFormBuilder';
import { AdvertiserStorageFolder } from '@/api/firebase/storage';
import { $Vertical, $Horizontal } from '@/components/generics';
import AirdropOfferExclusionPicker from './AirdropOfferExclusionPicker';
import AirdropCreateLootbox, {
  CreateLootboxRequest,
  LootboxBody,
  LOOTBOX_INFO,
} from './AirdropCreateLootbox';
import { useMutation } from '@apollo/client';
import { CreateLootboxResponseFE, CREATE_LOOTBOX } from './api.gql';
import QuestionEditor, { QuestionDef, QuestionEditorState, QuestionTypes } from '../QuestionEditor';
import { OfferAfterTicketClaimMetadata } from '../../api/graphql/generated/types';

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
    strategy?: OfferStrategyType;
    airdropMetadata?: OfferAirdropMetadata;
    afterTicketClaimMetadata?: OfferAfterTicketClaimMetadata;
  };
  offers: OfferPreview[];
  advertiserID: AdvertiserID;
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
  strategy: OfferStrategyType.None,
  airdropMetadata: {
    excludedOffers: [] as OfferID[],
    instructionsLink: '',
    instructionsCallToAction: '',
    callToActionLink: '',
    oneLiner: '',
    questions: [] as QuestionAnswerPreview[],
    value: '',
  },
  afterTicketClaimMetadata: {
    questions: [] as QuestionAnswerPreview[],
  },
};
const CreateOfferForm: React.FC<CreateOfferFormProps> = ({
  offer,
  onSubmit,
  mode,
  advertiserID,
  offers,
}) => {
  const chosenOffers = useRef([] as OfferID[]);
  const newMediaDestination = useRef('');
  const airdropQuestionsRef = useRef<QuestionEditorState>({});
  const afterTicketClaimsQuestionsRef = useRef<QuestionEditorState>({});
  const [form] = Form.useForm();
  // @ts-ignore
  const forceUpdate = FormBuilder.useForceUpdate();
  const [viewMode, setViewMode] = useState(true);
  const [pending, setPending] = useState(false);
  const [lootboxTemplateID, setLootboxTemplateID] = useState<LootboxID>();
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
        strategy: offer.strategy || OfferStrategyType.None,
        airdropMetadata: {
          excludedOffers: (offer.airdropMetadata?.excludedOffers || []) as OfferID[],
          instructionsLink: offer.airdropMetadata?.instructionsLink || '',
          instructionsCallToAction: offer.airdropMetadata?.instructionsCallToAction || '',
          callToActionLink: offer.airdropMetadata?.callToActionLink || 'Complete Task',
          oneLiner: offer.airdropMetadata?.oneLiner || '',
          questions: offer.airdropMetadata?.questions || [],
          value: offer.airdropMetadata?.value || '',
        },
        afterTicketClaimMetadata: {
          questions: offer.afterTicketClaimMetadata?.questions || [],
        },
      });
      chosenOffers.current = (offer.airdropMetadata?.excludedOffers || []) as OfferID[];
      if (offer.airdropMetadata && offer.airdropMetadata.questions) {
        const x = offer.airdropMetadata.questions.reduce((acc, curr) => {
          return {
            ...acc,
            [curr.id]: curr,
          };
        }, {} as QuestionEditorState);
        airdropQuestionsRef.current = x;
      }
      if (offer.afterTicketClaimMetadata && offer.afterTicketClaimMetadata.questions) {
        console.log(
          `offer.afterTicketClaimMetadata.questions`,
          offer.afterTicketClaimMetadata.questions,
        );
        const x = offer.afterTicketClaimMetadata.questions.reduce((acc, curr) => {
          return {
            ...acc,
            [curr.id]: curr,
          };
        }, {} as QuestionEditorState);
        console.log('x....', x);
        afterTicketClaimsQuestionsRef.current = x;
      }
    }
  }, [offer, advertiserID]);
  const [createLootboxMutation, { loading: loadingLootboxCreate }] = useMutation<
    CreateLootboxResponseFE,
    MutationCreateLootboxArgs
  >(CREATE_LOOTBOX);
  console.log(`---> offerInfo`, offerInfo);
  const handleFinish = useCallback(
    async (values) => {
      console.log(`lootboxTemplateID= ${lootboxTemplateID}`);
      if (
        form.getFieldValue('strategy') === OfferStrategyType.Airdrop &&
        !lootboxTemplateID &&
        mode === 'create'
      )
        return;
      setPending(true);
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
        payload.startDate = values.startDate;
      }
      if (values.endDate) {
        payload.endDate = values.endDate;
      }
      if (values.strategy && values.strategy === OfferStrategyType.Airdrop) {
        // @ts-ignore
        payload.strategy = values.strategy;
        // @ts-ignore
        console.log(`values = `, values);
        payload.airdropMetadata = {
          oneLiner: values.airdropMetadata_oneLiner,
          value: values.airdropMetadata_value || offerInfo.airdropMetadata.value,
          instructionsLink: values.airdropMetadata_instructionsLink,
          instructionsCallToAction: values.airdropMetadata_instructionsCallToAction,
          callToActionLink: values.airdropMetadata_callToActionLink,
          excludedOffers: chosenOffers.current,
          lootboxTemplateID: lootboxTemplateID,
          questions: [],
        };
        const hasQuestionsInPayload = payload.airdropMetadata && payload.airdropMetadata.questions;
        if (hasQuestionsInPayload) {
          Object.values(airdropQuestionsRef.current).forEach((q) => {
            if (q.question && q.type && hasQuestionsInPayload) {
              payload.airdropMetadata?.questions?.push({
                question: q.question,
                type: q.type,
                mandatory: q.mandatory,
                options: q.options,
              });
            }
          });
        }
      }
      if (values.strategy && values.strategy === OfferStrategyType.AfterTicketClaim) {
        // @ts-ignore
        payload.strategy = values.strategy;
        // @ts-ignore
        payload.afterTicketClaimMetadata = {
          questions: [],
        };
        const hasQuestionsInPayload =
          payload.afterTicketClaimMetadata && payload.afterTicketClaimMetadata.questions;
        if (hasQuestionsInPayload) {
          Object.values(afterTicketClaimsQuestionsRef.current).forEach((q) => {
            if (q.question && q.type && hasQuestionsInPayload) {
              payload.afterTicketClaimMetadata?.questions?.push({
                question: q.question,
                type: q.type,
                mandatory: q.mandatory,
                options: q.options,
              });
            }
          });
        }
      }
      if (newMediaDestination.current) {
        payload.image = newMediaDestination.current;
      }
      console.log(`Creating form...`);
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
    },
    [lootboxTemplateID],
  );
  const getMeta = () => {
    const meta = {
      columns: 2,
      disabled: pending,
      initialValues: offerInfo,
      fields: [
        {
          key: 'title',
          label: 'Title',
          required: true,
          tooltip:
            'The public title that partners or the marketplace sees when your offer is published.',
        },
        {
          key: 'affiliateBaseLink',
          label: 'Affiliate Link',
          required: mode === 'create' ? true : false,
          disabled: mode === 'create' ? false : true,
          rules: [
            { required: true } as Rule,
            { type: 'url' } as Rule,
            { type: 'string', min: 3 } as Rule,
          ],
          tooltip:
            'The trackable link that your users click when they go to claim your offer. This can be your website, an appstore, or a checkout page for example.',
        },
        {
          key: 'mmp',
          label: 'Tracking',
          disabled: mode === 'create' ? false : true,
          widget: 'select',
          options: [
            MeasurementPartnerType.Appsflyer,
            MeasurementPartnerType.GoogleTagManager,
            MeasurementPartnerType.Manual,
            MeasurementPartnerType.None,
          ],
          tooltip:
            'The tracking software your offer uses to measure performance. Talk with the LOOTBOX team on how to set this up.',
        },
        {
          key: 'strategy',
          label: 'Strategy',
          disabled: mode === 'create' ? false : true,
          widget: 'select',
          options: [
            OfferStrategyType.None,
            OfferStrategyType.Airdrop,
            OfferStrategyType.AfterTicketClaim,
          ],
          tooltip:
            'The special marketing strategy for this offer. Check the LOOTBOX tutorial docs for more information.',
        },
        {
          key: 'status',
          label: 'Status',
          widget: 'radio-group',
          // @ts-ignore
          options: [
            // @ts-ignore
            OfferStatus.Active,
            // @ts-ignore
            OfferStatus.Inactive,
            // @ts-ignore
            OfferStatus.Planned,
            // @ts-ignore
            OfferStatus.Archived,
          ],
          tooltip:
            'An internal field that only your team can see. Only Active offers can be used in events.',
        },
      ],
    };
    if (mode !== 'create') {
      // @ts-ignore
      meta.fields.push({
        key: 'startDate',
        label: 'Start Date',
        widget: 'date-picker',
        // @ts-ignore
        viewWidget: DateView,
        tooltip:
          "The date your offer starts being valid. This is an internal field that only your team can see. You must manually update the status of your offer to 'Active' to make it visible to partners.",
      });
      // @ts-ignore
      meta.fields.push({
        key: 'maxBudget',
        label: 'Max Budget',
        // @ts-ignore
        widget: PriceInput,
        viewWidget: PriceView,
        initialValue: {
          // @ts-ignore
          price: mode === 'create' ? 1000 : offer?.maxBudget || 1000,
          currency: 'USDC Polygon',
        },
        tooltip:
          "An internal field that only your team can see. It's the maximum budget you're willing to spend on this offer.",
      });
      // @ts-ignore
      meta.fields.push({
        key: 'endDate',
        label: 'End Date',
        // @ts-ignore
        widget: 'date-picker',
        // @ts-ignore
        viewWidget: DateView,
        tooltip:
          "The date your offer stops being valid. This is an internal field that only your team can see. You must manually update the status of your offer to 'Inactive' to make it not visible to partners.",
      });
      // @ts-ignore
      meta.fields.push({
        key: 'description',
        label: 'Description',
        widget: 'textarea',
        tooltip:
          'The public description of your offer that partners read to understand what your offer goals are.',
      });
      if (!viewMode) {
        // @ts-ignore
        meta.fields.push({
          key: 'image',
          label: 'Image',
          // @ts-ignore
          widget: () => (
            <AntUploadFile
              advertiserID={advertiserID}
              folderName={AdvertiserStorageFolder.OFFER_IMAGE}
              newMediaDestination={newMediaDestination}
              acceptedFileTypes={'image/*'}
            />
          ),
          tooltip:
            "The offer's image that partners see when your offer is published to the marketplace.",
        });
      }
    }
    return meta;
  };
  const getMetaForAirdrop1 = () => {
    const meta = {
      columns: mode === 'create' ? 1 : 2,
      disabled: pending,
      initialValues: offerInfo,
      fields: [
        {
          key: 'airdropMetadata_oneLiner',
          label: 'Task to Complete',
          initialValue: offerInfo?.airdropMetadata.oneLiner,
          tooltip:
            'One line description of what you want the user to do to claim your airdrop reward. Max 50 characters.',
          rules: [{ type: 'string', max: 50 } as Rule],
        },
        {
          key: 'airdropMetadata_value',
          label: `Reward Value`,
          initialValue: offerInfo?.airdropMetadata.value,
          tooltip:
            'The approximate value of the airdropped reward. This is shown to the user when they see your offer. It should ideally be priced in Fiat to be more understandable.',
          rules: [{ type: 'string', max: 20 } as Rule],
        },
        {
          key: 'airdropMetadata_instructionsLink',
          label: 'Video Instructions',
          initialValue: offerInfo?.airdropMetadata.instructionsLink,
          tooltip:
            'Link to a YouTube video or Notion page where users will go to see your full instructions. It should be easy to follow. Use a placeholder bitly or google docs link if you do not have this yet.',
          rules: [
            { type: 'url' } as Rule,
            { type: 'string', min: 3 } as Rule,
            {
              validator: (rule: any, value: any, callback: any) => {
                // Do async validation to check if username already exists
                // Use setTimeout to emulate api call
                return new Promise((resolve, reject) => {
                  if (
                    offerInfo?.airdropMetadata.instructionsLink.indexOf('youtube.com/embed') === -1
                  ) {
                    resolve('success');
                  } else {
                    reject(new Error(`Must be a YouTube embed video link`));
                  }
                });
              },
            },
          ],
          viewWidget: () => (
            <a
              href={offerInfo?.airdropMetadata.instructionsLink || ''}
              target="_blank"
              rel="noreferrer"
            >{`${offerInfo?.airdropMetadata.instructionsLink.slice(0, 25)}...`}</a>
          ),
        },
        {
          key: 'airdropMetadata_instructionsCallToAction',
          label: 'Call to Action',
          initialValue: offerInfo?.airdropMetadata.instructionsCallToAction || 'Start Task',
          tooltip: 'Call to action to complete the task, after watching the instructional video.',
          rules: [{ type: 'string', max: 20 } as Rule],
        },
        {
          key: 'airdropMetadata_callToActionLink',
          label: 'CTA Link',
          initialValue:
            offerInfo?.airdropMetadata.callToActionLink || form.getFieldValue('affiliateBaseLink'),
          tooltip: 'Affiliate link to complete the asked task when clicking the call to action',
          rules: [{ type: 'url' } as Rule, { type: 'string', min: 3 } as Rule],
          viewWidget: () => (
            <a
              href={offerInfo?.airdropMetadata.callToActionLink || ''}
              target="_blank"
              rel="noreferrer"
            >{`${offerInfo?.airdropMetadata.callToActionLink.slice(0, 25)}...`}</a>
          ),
        },
      ],
    };
    return meta;
  };
  const renderAirdropOfferExclusionPicker = () => {
    return (
      <$Vertical>
        <span>Exclude Users who have redeemed past Airdrop Offers</span>
        <AirdropOfferExclusionPicker
          listOfOffers={offers}
          chosenOffers={chosenOffers}
          disabled={viewMode}
          initialSelectedKeys={chosenOffers.current}
        />
      </$Vertical>
    );
  };
  // const getMetaForAirdrop2 = () => {
  //   const meta = {
  //     columns: 2,
  //     disabled: mode === 'create' ? pending : true,
  //     initialValues: offerInfo,
  //     fields: [
  //       {
  //         key: 'airdropMetadata_questionOneText',
  //         label: 'Question 1',
  //         initialValue: offerInfo?.airdropMetadata.questions[0]?.question || '',
  //         tooltip:
  //           'You can ask up to 2 questions from the user for your data analysis purposes. Watch the tutorial for our recommendations.',
  //         rules: [{ type: 'string', min: 3 } as Rule],
  //       },
  //       {
  //         key: 'airdropMetadata_questionOneType',
  //         label: 'Field Type',
  //         initialValue: offerInfo?.airdropMetadata.questions[0]?.type || QuestionFieldType.Text,
  //         tooltip:
  //           'Choose text answers for the most flexible. Address refers to a blockchain address. Screenshot is an image upload.',
  //         widget: 'select',
  //         options: QuestionTypes,
  //       },
  //       {
  //         key: 'airdropMetadata_questionTwoText',
  //         label: 'Question 2',
  //         initialValue: offerInfo?.airdropMetadata.questions[1]?.question || '',
  //         tooltip:
  //           'You can ask up to 2 questions from the user for your data analysis purposes. Watch the tutorial for our recommendations.',
  //         rules: [{ type: 'string', min: 3 } as Rule],
  //       },
  //       {
  //         key: 'airdropMetadata_questionTwoType',
  //         label: 'Field Type',
  //         initialValue: offerInfo?.airdropMetadata.questions[1]?.type || QuestionFieldType.Text,
  //         tooltip:
  //           'Choose text answers for the most flexible. Address refers to a blockchain address. Screenshot is an image upload.',
  //         widget: 'select',
  //         options: QuestionTypes,
  //       },
  //     ],
  //   };
  //   return meta;
  // };
  const getMetaForAirdrop3 = () => {
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: offerInfo,
      fields: [
        {
          key: 'offerIDs',
          rules: [],
          widget: renderAirdropOfferExclusionPicker,
          viewWidget: <i style={{ color: 'gray' }}>Edit Offer to view the Exclusion List</i>,
        },
      ],
    };
    return meta;
  };

  const createLootbox = async (
    request: CreateLootboxRequest,
  ): Promise<{ lootboxID: LootboxID }> => {
    console.log(`

      request.payload.name = ${request.payload.name}
      request.payload.name.slice(0, 11) = ${request.payload.name?.slice(0, 11)}
      request.payload.maxTickets = ${request.payload.maxTickets}

      `);
    const res = await createLootboxMutation({
      variables: {
        payload: {
          name: request.payload.name,
          description: request.payload.description,
          logo: request.payload.logoImage,
          backgroundImage: request.payload.backgroundImage,
          nftBountyValue: request.payload.nftBountyValue,
          joinCommunityUrl: request.payload.joinCommunityUrl,
          maxTickets: request.payload.maxTickets,
          themeColor: request.payload.themeColor,
          tournamentID: '',
          type: LootboxType.Airdrop,
        },
      },
    });

    if (res?.data?.createLootbox.__typename === 'CreateLootboxResponseSuccess') {
      const lid = res.data.createLootbox.lootbox.id;
      console.log(`lootboxID = `, lid);
      setLootboxTemplateID(lid);
      message.success('Lootbox created successfully');
      return { lootboxID: lid };
    }

    throw new Error('An error occured!');
  };
  const questions: QuestionDef[] = [];

  return (
    <Card style={{ flex: 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {viewMode && !lockedToEdit && (
          <Button type="link" onClick={() => setViewMode(false)} style={{ alignSelf: 'flex-end' }}>
            Edit
          </Button>
        )}
        <Form layout="horizontal" form={form} onFinish={handleFinish} onValuesChange={forceUpdate}>
          <fieldset>
            <legend>Offer Details</legend>
            <FormBuilder form={form} meta={getMeta()} viewMode={viewMode} />
          </fieldset>
          {(form.getFieldValue('strategy') === OfferStrategyType.Airdrop ||
            offerInfo.strategy === OfferStrategyType.Airdrop) &&
            mode === 'create' && (
              <fieldset>
                <legend>Airdrop Template</legend>
                <AirdropCreateLootbox
                  lootboxTemplateID={lootboxTemplateID}
                  onSubmitCreate={createLootbox}
                  saveProgressOfLootbox={(info) =>
                    form.setFieldsValue({ airdropMetadata_value: info.nftBountyValue })
                  }
                  mode="create"
                  airdropParams={{
                    tournamentID: '' as TournamentID,
                    numClaimers: 1,
                    teamName: offerInfo.title,
                    value: offerInfo.airdropMetadata.value,
                  }}
                />
              </fieldset>
            )}
          {(form.getFieldValue('strategy') === OfferStrategyType.Airdrop ||
            offerInfo.strategy === OfferStrategyType.Airdrop) && (
            <fieldset
              style={{
                opacity: lootboxTemplateID || mode !== 'create' ? 1 : 0.2,
              }}
            >
              <legend>Airdrop Details</legend>
              <FormBuilder form={form} meta={getMetaForAirdrop1()} viewMode={viewMode} />
              <$Horizontal justifyContent="flex-end">
                <div style={{ maxWidth: '800px', width: '100%' }}>
                  <QuestionEditor
                    viewMode={viewMode || mode !== 'create'}
                    questionsRef={airdropQuestionsRef}
                  />
                </div>
              </$Horizontal>
              {!viewMode && (
                <$Horizontal justifyContent="flex-end">
                  <FormBuilder form={form} meta={getMetaForAirdrop3()} viewMode={viewMode} />
                </$Horizontal>
              )}
            </fieldset>
          )}
          <br />
          {form.getFieldValue('strategy') === OfferStrategyType.AfterTicketClaim ||
          offerInfo.strategy === OfferStrategyType.AfterTicketClaim ? (
            <fieldset>
              <legend>After Ticket Claim</legend>
              {questions && (
                <QuestionEditor
                  viewMode={viewMode || mode !== 'create'}
                  questionsRef={afterTicketClaimsQuestionsRef}
                />
              )}
            </fieldset>
          ) : null}
          {!viewMode && (
            <fieldset>
              <legend>Finish</legend>
              <$Horizontal justifyContent="flex-end">
                <Form.Item className="form-footer">
                  {mode === 'create' ? (
                    <Button
                      htmlType="submit"
                      type="primary"
                      disabled={
                        pending ||
                        (form.getFieldValue('strategy') === OfferStrategyType.Airdrop &&
                          !lootboxTemplateID)
                      }
                    >
                      {form.getFieldValue('strategy') === OfferStrategyType.Airdrop &&
                      !lootboxTemplateID
                        ? 'Save Template First'
                        : pending
                        ? 'Creating...'
                        : 'Create'}
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
              </$Horizontal>
            </fieldset>
          )}
        </Form>
      </div>
    </Card>
  );
};

export default CreateOfferForm;
