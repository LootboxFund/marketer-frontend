import {
  ViewCreatedOfferResponse,
  QueryViewCreatedOfferArgs,
  Offer,
  EditOfferPayload,
  ResponseError,
  MutationEditOfferArgs,
  EditOfferResponseSuccess,
  CreateActivationInput,
  Activation,
  EditActivationResponseSuccess,
  CreateActivationResponseSuccess,
  MutationCreateActivationArgs,
  MutationEditActivationArgs,
  EditActivationInput,
  WhitelistAffiliateToOfferResponse,
  MutationWhitelistAffiliateToOfferArgs,
  QueryListWhitelistedAffiliatesToOfferArgs,
  ListWhitelistedAffiliatesToOfferResponse,
  OrganizerOfferWhitelistWithProfile,
  OrganizerOfferWhitelistStatus,
  EditWhitelistAffiliateToOfferResponse,
  MutationEditWhitelistAffiliateToOfferArgs,
  OfferPreview,
  ListCreatedOffersResponse,
  QueryListCreatedOffersArgs,
  OfferVisibility,
} from '@/api/graphql/generated/types';
import { history } from '@umijs/max';
import { ActivationStatus } from '@/api/graphql/generated/types';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import {
  Spin,
  Image,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Input,
  Switch,
  Empty,
  Popconfirm,
  message,
  Tabs,
} from 'antd';
import React, { useCallback, useState } from 'react';
import {
  CREATE_ACTIVATION,
  EDIT_OFFER,
  GET_OFFER,
  EDIT_ACTIVATION,
  GET_AFFILIATE,
  WHITELIST_AFFILIATE,
  LIST_WHITELISTED_AFFILIATES,
  EDIT_WHITELIST_AFFILIATE,
} from './api.gql';
import styles from './index.less';
import { useParams } from 'react-router-dom';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';
import {
  $ColumnGap,
  $Horizontal,
  $InfoDescription,
  $Vertical,
  placeholderImage,
} from '@/components/generics';
import CreateOfferForm from '@/components/CreateOfferForm';
import { ActivationID, AdvertiserID, formatBigNumber, OfferID } from '@wormgraph/helpers';
import CreateActivationFormModal from '@/components/CreateActivationFormModal';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { LIST_CREATED_OFFERS } from '../OffersPage/api.gql';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import { AdSetStatus, OfferStrategyType } from '../../../api/graphql/generated/types';
import { Link } from '@umijs/max';
import Meta from 'antd/lib/card/Meta';
import { LIST_PARTNERS } from '../PartnersPage/api.gql';
import ActivationFunnel from '@/components/OfferAnalytics/components/ActivationFunnel';

const OfferPage: React.FC = () => {
  // get the advertiser user
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  // do the rest
  const { offerID } = useParams();
  const [offer, setOffer] = useState<Offer>();

  const [activationModalVisible, setActivationModalVisible] = useState(false);
  const toggleActivationModal = useCallback(
    (visible: boolean) => setActivationModalVisible(visible),
    [setActivationModalVisible],
  );
  const [pendingActivationEdit, setPendingActivationEdit] = useState(false);
  const [activationModalType, setActivationModalType] = useState<'create' | 'view-edit' | null>(
    null,
  );
  const [activationToEdit, setActivationToEdit] = useState<Activation | null>(null);

  const [whitelistedPartners, setWhitelistedPartners] = useState<
    OrganizerOfferWhitelistWithProfile[]
  >([]);
  const [addPartnerModalVisible, setAddPartnerModalVisible] = useState(false);
  const [addPartnerPending, setAddPartnerPending] = useState(false);
  const [updatingWhitelist, setUpdatingWhitelist] = useState<string | null>(null);

  // GET OFFER
  const { data, loading, error } = useQuery<
    { viewCreatedOffer: ViewCreatedOfferResponse },
    QueryViewCreatedOfferArgs
  >(GET_OFFER, {
    variables: { offerID: offerID || '' },
    onCompleted: (data) => {
      console.log('yoooo?', data);
      if (data?.viewCreatedOffer.__typename === 'ViewCreatedOfferResponseSuccess') {
        const offer = data.viewCreatedOffer.offer;

        setOffer(offer);
      }
    },
  });
  // EDIT OFFER
  const [editOfferMutation] = useMutation<
    { editOffer: ResponseError | EditOfferResponseSuccess },
    MutationEditOfferArgs
  >(EDIT_OFFER, {
    refetchQueries: [
      { query: GET_OFFER, variables: { offerID } },
      { query: LIST_CREATED_OFFERS, variables: { advertiserID } },
    ],
  });
  // CREATE ACTIVATION
  const [createActivationMutation] = useMutation<
    { createActivation: ResponseError | CreateActivationResponseSuccess },
    MutationCreateActivationArgs
  >(CREATE_ACTIVATION, {
    refetchQueries: [{ query: GET_OFFER, variables: { offerID } }],
  });
  // EDIT ACTIVATION
  const [editActivationMutation] = useMutation<
    { editActivation: ResponseError | EditActivationResponseSuccess },
    MutationEditActivationArgs
  >(EDIT_ACTIVATION, {
    refetchQueries: [{ query: GET_OFFER, variables: { offerID } }],
  });
  // LIST OFFERS
  const [offers, setOffers] = useState<OfferPreview[]>([]);
  const {
    data: listOffersData,
    loading: listOffersLoading,
    error: listOffersError,
  } = useQuery<{ listCreatedOffers: ListCreatedOffersResponse }, QueryListCreatedOffersArgs>(
    LIST_CREATED_OFFERS,
    {
      variables: { advertiserID },
      onCompleted: (data) => {
        if (data?.listCreatedOffers.__typename === 'ListCreatedOffersResponseSuccess') {
          const offers = data.listCreatedOffers.offers;
          // console.log(offers);
          setOffers(offers);
        }
      },
    },
  );
  // SWAP POSITIONS ACTIVATION
  const [swapActivationPositionsMutation] = useMutation<
    { editActivation: ResponseError | EditActivationResponseSuccess },
    MutationEditActivationArgs
  >(EDIT_ACTIVATION);
  // LIST PARTNERS OF OFFER
  const {
    data: listOfWhitelistedPartnersData,
    loading: loadingListOfWhitelistedPartners,
    error: errorListOfWhitelistedPartners,
  } = useQuery<
    { listWhitelistedAffiliatesToOffer: ListWhitelistedAffiliatesToOfferResponse },
    QueryListWhitelistedAffiliatesToOfferArgs
  >(LIST_WHITELISTED_AFFILIATES, {
    variables: { payload: { offerID: offerID || '' } },
    onCompleted: (data) => {
      if (
        data?.listWhitelistedAffiliatesToOffer.__typename ===
        'ListWhitelistedAffiliatesToOfferResponseSuccess'
      ) {
        const whitelistedPartners = data.listWhitelistedAffiliatesToOffer.whitelists;

        setWhitelistedPartners(whitelistedPartners);
      }
    },
  });
  // LAZY GET PARTNER
  const [getPartner, { loading: loadingPartner, error: errorPartner, data: dataPartner }] =
    useLazyQuery(GET_AFFILIATE);
  // WHITELIST PARTNER
  const [whitelistAffiliate] = useMutation<
    { whitelistAffiliateToOffer: ResponseError | WhitelistAffiliateToOfferResponse },
    MutationWhitelistAffiliateToOfferArgs
  >(WHITELIST_AFFILIATE, {
    refetchQueries: [
      { query: LIST_WHITELISTED_AFFILIATES, variables: { payload: { offerID: offerID || '' } } },
      { query: LIST_PARTNERS, variables: { advertiserID: advertiserID || '' } },
    ],
  });
  // UPDATE WHITELIST
  const [updateWhitelist] = useMutation<
    { updatedWhitelistedAffiliate: ResponseError | EditWhitelistAffiliateToOfferResponse },
    MutationEditWhitelistAffiliateToOfferArgs
  >(EDIT_WHITELIST_AFFILIATE, {
    refetchQueries: [
      { query: LIST_WHITELISTED_AFFILIATES, variables: { payload: { offerID: offerID || '' } } },
    ],
  });

  const analyticTabItems = [
    {
      label: 'Activation Funnel',
      key: 'offer_activation_funnel',
      children: (
        <ActivationFunnel
          offerID={offerID as OfferID}
          openInviteParterModal={() => {
            setAddPartnerModalVisible(true);
          }}
        />
      ),
    },
  ];

  if (listOffersError) {
    return <span>{listOffersError?.message || ''}</span>;
  } else if (listOffersData?.listCreatedOffers.__typename === 'ResponseError') {
    return <span>{listOffersData?.listCreatedOffers.error?.message || ''}</span>;
  }
  if (!offerID) {
    return <div>Offer ID not found</div>;
  }
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.viewCreatedOffer.__typename === 'ResponseError') {
    return <span>{data?.viewCreatedOffer.error?.message || ''}</span>;
  }
  if (errorListOfWhitelistedPartners) {
    return <span>{errorListOfWhitelistedPartners?.message || ''}</span>;
  } else if (
    listOfWhitelistedPartnersData?.listWhitelistedAffiliatesToOffer?.__typename === 'ResponseError'
  ) {
    return (
      <span>
        {listOfWhitelistedPartnersData?.listWhitelistedAffiliatesToOffer?.error?.message || ''}
      </span>
    );
  }
  const editOffer = async (payload: Omit<EditOfferPayload, 'id'>) => {
    const requestPayload: EditOfferPayload = {
      id: offerID,
      advertiserID,
      title: payload.title,
      description: payload.description,
      image: payload.image,
      maxBudget: payload.maxBudget,
      startDate: payload.startDate,
      endDate: payload.endDate,
      status: payload.status,
      visibility: payload.visibility,
    };
    if (payload.airdropMetadata) {
      requestPayload.airdropMetadata = payload.airdropMetadata;
    }
    if (payload.visibility) {
      requestPayload.visibility = payload.visibility;
    }
    const res = await editOfferMutation({
      variables: {
        payload: requestPayload,
      },
    });
    if (!res?.data || res?.data?.editOffer?.__typename === 'ResponseError') {
      throw new Error(
        res?.data?.editOffer?.__typename === 'ResponseError'
          ? res.data.editOffer.error?.message
          : 'An error occured',
      );
    }
  };

  const createActivation = async (payload: Omit<CreateActivationInput, 'offerID'>) => {
    const res = await createActivationMutation({
      variables: {
        payload: {
          offerID: offerID as OfferID,
          activation: {
            name: payload.name,
            description: payload.description || '',
            pricing: payload.pricing,
            status: payload.status,
            mmp: payload.mmp,
            mmpAlias: payload.mmpAlias,
            offerID: offerID as OfferID,
          },
        },
      },
    });
    if (!res?.data || res?.data?.createActivation?.__typename === 'ResponseError') {
      throw new Error(
        res?.data?.createActivation?.__typename === 'ResponseError'
          ? res.data.createActivation.error?.message
          : 'An error occured',
      );
    }
    setActivationModalVisible(false);
    setActivationModalType(null);
  };
  const editActivation = async (
    activationID: ActivationID,
    payload: Omit<EditActivationInput, 'offerID'>,
  ) => {
    const res = await editActivationMutation({
      variables: {
        payload: {
          activationID,
          activation: {
            name: payload.name,
            description: payload.description || '',
            pricing: payload.pricing,
            status: payload.status,
            id: activationID,
            order: payload.order,
          },
        },
      },
    });
    if (!res?.data || res?.data?.editActivation?.__typename === 'ResponseError') {
      throw new Error(
        res?.data?.editActivation?.__typename === 'ResponseError'
          ? res.data.editActivation.error?.message
          : 'An error occured',
      );
    }
    setActivationModalVisible(false);
    setActivationModalType(null);
    setActivationToEdit(null);
  };
  const swapPositionsInFunnel = async ({
    oldLow,
    oldHigh,
  }: {
    oldLow: Activation;
    oldHigh: Activation;
  }) => {
    const newHigherPosition = oldLow.order === oldHigh.order ? oldHigh.order + 1 : oldHigh.order;
    const newLowerPosition = oldLow.order === oldHigh.order ? oldLow.order - 1 : oldLow.order;
    if (offer && offer.activations) {
      const newOfferStatus = {
        ...offer,
        activations: offer.activations.map((activation) => {
          if (activation.id === oldLow.id) {
            return { ...activation, order: newHigherPosition };
          }
          if (activation.id === oldHigh.id) {
            return { ...activation, order: newLowerPosition };
          }
          return activation;
        }),
      };
      setOffer(newOfferStatus);
    }
    await Promise.all([
      swapActivationPositionsMutation({
        variables: {
          payload: {
            activationID: oldLow.id as ActivationID,
            activation: {
              id: oldLow.id as ActivationID,
              order: newHigherPosition,
            },
          },
        },
      }),
      swapActivationPositionsMutation({
        variables: {
          payload: {
            activationID: oldHigh.id as ActivationID,
            activation: {
              id: oldHigh.id as ActivationID,
              order: newLowerPosition,
            },
          },
        },
      }),
    ]);
  };
  const breadLine = [
    { title: 'Manage', route: '/manage' },
    { title: 'Offers', route: '/manage/offers' },
    { title: offer?.title || '', route: `/manage/offers/id/${offer?.id}` },
  ];
  const gridStyle: React.CSSProperties = {
    flex: '100%',
  };
  const searchedPartner = dataPartner?.affiliatePublicView?.affiliate;
  const maxWidth = '1000px';
  const activationsSorted = (offer?.activations || [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .sort((a, b) => (a.status === ActivationStatus.Active ? -1 : 1));
  const adSetPreviewsSorted = (offer?.adSetPreviews || [])
    .slice()
    .sort((a, b) => (a.status === AdSetStatus.Active ? -1 : 1));
  console.log(`--- offer ---`);
  console.log(offer);
  console.log(offers);
  return (
    <div style={{ maxWidth }}>
      {loading || !offer ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <BreadCrumbDynamic breadLine={breadLine} />

          <h1>{offer.title}</h1>
          <$InfoDescription>
            {`This is the Offer Control Panel for "${offer.title}". You can edit the offer details and manage its activation events with payout amounts.`}
            {` `}To learn more,{' '}
            <span>
              <a href="https://lootbox.fyi/3gx5Iuu" target="_blank" rel="noreferrer">
                click here for a tutorial.
              </a>
            </span>
          </$InfoDescription>
          <$Horizontal>
            <CreateOfferForm
              offer={{
                title: offer.title,
                description: offer.description || '',
                image: offer.image || '',
                advertiserID:
                  (offer.advertiserID as AdvertiserID) || (advertiserID as AdvertiserID),
                maxBudget: offer.maxBudget || 0,
                startDate: offer.startDate,
                endDate: offer.endDate,
                status: offer.status,
                affiliateBaseLink: offer.affiliateBaseLink || '',
                mmp: offer.mmp,
                strategy: offer.strategy || OfferStrategyType.None,
                visibility: offer.visibility || OfferVisibility.Private,
                airdropMetadata: offer.airdropMetadata
                  ? {
                      excludedOffers: offer.airdropMetadata.excludedOffers,
                      instructionsLink: offer.airdropMetadata.instructionsLink,
                      instructionsCallToAction: offer.airdropMetadata.instructionsCallToAction,
                      callToActionLink: offer.airdropMetadata.callToActionLink,
                      oneLiner: offer.airdropMetadata.oneLiner,
                      value: offer.airdropMetadata.value,
                      questions: offer.airdropMetadata.questions,
                      lootboxTemplateID: offer.airdropMetadata.lootboxTemplateID,
                      lootboxTemplateStamp: offer.airdropMetadata.lootboxTemplateStamp,
                    }
                  : undefined,
                afterTicketClaimMetadata: offer.afterTicketClaimMetadata
                  ? { questions: offer.afterTicketClaimMetadata.questions }
                  : undefined,
              }}
              offers={offers.filter((o) => o.strategy === OfferStrategyType.Airdrop)}
              advertiserID={advertiserID as AdvertiserID}
              // @ts-ignore
              onSubmit={editOffer}
              mode="view-edit"
            />
            <$ColumnGap />
            <Image width={200} src={offer.image || ''} />
          </$Horizontal>

          <br />
          <br />
          <$Horizontal justifyContent="space-between">
            <h2>Activation Funnel</h2>
            <Button
              onClick={() => {
                setActivationModalType('create');
                setActivationToEdit(null);
                setActivationModalVisible(true);
              }}
              style={{ alignSelf: 'flex-end' }}
            >
              Add Activation
            </Button>
          </$Horizontal>
          <$InfoDescription>
            {`Activations are specific events that you want to happen in an offer. They typically occur chronologically in a sales funnel.`}
            {` `}To learn more,{' '}
            <span>
              <a href="https://lootbox.fyi/3FK3X7I" target="_blank" rel="noreferrer">
                click here for a tutorial.
              </a>
            </span>
          </$InfoDescription>
          {activationsSorted && activationsSorted.length > 0 ? (
            <Card>
              {activationsSorted.map((activation, i) => {
                return (
                  <Card.Grid key={activation.id} style={gridStyle}>
                    <Row
                      style={activation.status !== ActivationStatus.Active ? { opacity: 0.2 } : {}}
                    >
                      <Col span={14} className={styles.verticalCenter}>
                        {activation.name}{' '}
                        {activation.status !== ActivationStatus.Active
                          ? ` (${activation.status})`
                          : ''}
                      </Col>
                      <Col
                        span={4}
                        className={styles.verticalCenter}
                        style={{ alignItems: 'flex-end' }}
                      >
                        ${activation.pricing}
                      </Col>
                      <Col span={4} className={styles.verticalCenter}>
                        <$Horizontal justifyContent="flex-end">
                          <CaretUpOutlined
                            onClick={() => {
                              if (i - 1 >= 0) {
                                const prev = activationsSorted[i - 1];
                                const curr = activationsSorted[i];
                                swapPositionsInFunnel({
                                  oldLow: prev,
                                  oldHigh: curr,
                                });
                              }
                            }}
                            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                          />
                          <$ColumnGap />
                          <CaretDownOutlined
                            onClick={() => {
                              if (i + 1 < activationsSorted.length) {
                                const curr = activationsSorted[i];
                                const next = activationsSorted[i + 1];
                                swapPositionsInFunnel({
                                  oldLow: curr,
                                  oldHigh: next,
                                });
                              }
                            }}
                            style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                          />
                        </$Horizontal>
                      </Col>
                      <Col span={2} style={{ textAlign: 'right' }}>
                        <Button
                          type="link"
                          onClick={() => {
                            setActivationModalType('view-edit');
                            setActivationToEdit(activation);
                            setActivationModalVisible(true);
                          }}
                          style={{ alignSelf: 'flex-end' }}
                        >
                          View
                        </Button>
                      </Col>
                    </Row>
                  </Card.Grid>
                );
              })}
            </Card>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{
                height: 60,
              }}
              description={
                <span style={{ maxWidth: '200px' }}>
                  {`You have not added any activations to this offer yet. Add one now to get started!`}
                </span>
              }
              style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '50px' }}
            >
              <Button
                onClick={() => {
                  setActivationModalType('create');
                  setActivationModalVisible(true);
                }}
              >
                Add Activation
              </Button>
            </Empty>
          )}

          <br />
          <br />
          <$Horizontal justifyContent="space-between">
            <h2>Offer Analytics</h2>
            <Button
              onClick={() => {
                setAddPartnerModalVisible(true);
              }}
              style={{ alignSelf: 'flex-end' }}
            >
              Invite Partner
            </Button>
          </$Horizontal>

          <$InfoDescription>
            Your partners will drive activations for your offer. See how many activations have been
            made so far.
          </$InfoDescription>
          <Card>
            <Tabs items={analyticTabItems} type="card" />
          </Card>

          <br />
          <br />
          <$Horizontal justifyContent="space-between">
            <h2>Ad Sets</h2>
            <Popconfirm
              title={
                <span>
                  {`Go to an Ad Sets' control panel to include it into an Offer. `}
                  <a href="https://lootbox.fyi/3B23RoO" target="_blank" rel="noreferrer">
                    View Tutorial
                  </a>
                </span>
              }
              onConfirm={() => {
                history.push('/manage/adsets');
              }}
              okText="View Ad Sets"
              cancelText="Cancel"
            >
              <Button style={{ alignSelf: 'flex-end' }}>Include Ad Set</Button>
            </Popconfirm>
          </$Horizontal>
          <$InfoDescription>
            {`Offers should include Ad Sets that play video ads on various ad placecment spots - primarily on Lootbox tickets.`}
            {` `}To learn more,{' '}
            <span>
              <a href="https://lootbox.fyi/3AIa4G0" target="_blank" rel="noreferrer">
                click here for a tutorial.
              </a>
            </span>
          </$InfoDescription>
          {adSetPreviewsSorted.length > 0 ? (
            <div className={styles.adSetGrid}>
              {adSetPreviewsSorted.map((adSet) => {
                const imageToDisplay = adSet.thumbnail || placeholderImage;
                return (
                  <Link key={adSet.id} to={`/manage/adsets/id/${adSet.id}`}>
                    <Card
                      hoverable
                      className={styles.card}
                      cover={
                        <img alt="example" src={imageToDisplay} className={styles.cardImage} />
                      }
                    >
                      <Meta title={adSet.name} />
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{
                height: 60,
              }}
              description={
                <span style={{ maxWidth: '200px' }}>
                  {`You have not included any Ads to this event yet. Go to your Ad Sets page to get started!`}
                </span>
              }
              style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '50px' }}
            >
              <Link to="/manage/adsets">
                <Button>Include Ad</Button>
              </Link>
            </Empty>
          )}
          <br />
          <br />
          <$Horizontal justifyContent="space-between">
            <h2>Allowed Partners</h2>
            <Button
              onClick={() => {
                setAddPartnerModalVisible(true);
              }}
              style={{ alignSelf: 'flex-end' }}
            >
              Invite Partner
            </Button>
          </$Horizontal>
          <$InfoDescription>
            {`You can control who has access to your offer as an Event Organizer.`}
            {` `}To learn more,{' '}
            <span>
              <a href="https://lootbox.fyi/3tVx80n" target="_blank" rel="noreferrer">
                click here for a tutorial.
              </a>
            </span>
          </$InfoDescription>
          {whitelistedPartners.length > 0 ? (
            <div className={styles.whitelistedPartnersGrid}>
              {whitelistedPartners.map((whitelist) => (
                <Link
                  key={whitelist.whitelist.id}
                  to={`/manage/partners/id/${whitelist.organizer.id}`}
                >
                  <Card
                    hoverable
                    className={styles.card}
                    cover={
                      <img
                        alt="example"
                        src={whitelist.organizer.avatar || ''}
                        className={styles.cardImage}
                      />
                    }
                    actions={[
                      <$Horizontal
                        key={`switch-${whitelist.whitelist.id}`}
                        onClick={(e) => e.preventDefault()}
                        justifyContent="space-around"
                        width="100%"
                      >
                        <span>{whitelist.whitelist.status}</span>
                        <Switch
                          checked={
                            whitelist.whitelist.status === OrganizerOfferWhitelistStatus.Active
                          }
                          loading={updatingWhitelist === whitelist.whitelist.id}
                          onChange={async (checked) => {
                            setUpdatingWhitelist(whitelist.whitelist.id);
                            const newStatus = checked
                              ? OrganizerOfferWhitelistStatus.Active
                              : OrganizerOfferWhitelistStatus.Inactive;
                            await updateWhitelist({
                              variables: {
                                payload: {
                                  id: whitelist.whitelist.id,
                                  status: newStatus,
                                  advertiserID,
                                  affiliateID: whitelist.organizer.id,
                                  offerID: whitelist.whitelist.offerID,
                                },
                              },
                            });
                            message.success(
                              `Successfully set this partners access to ${newStatus}`,
                            );
                            setUpdatingWhitelist(null);
                          }}
                        />
                      </$Horizontal>,
                    ]}
                  >
                    <Meta title={whitelist.organizer.name} />
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{
                height: 60,
              }}
              description={
                <span style={{ maxWidth: '200px' }}>
                  {`You have not added any partners yet. Invite one now to get started!`}
                </span>
              }
              style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '50px' }}
            >
              <Button
                onClick={() => {
                  setAddPartnerModalVisible(true);
                }}
              >
                Invite Partner
              </Button>
            </Empty>
          )}

          <br />
          <br />

          {activationModalType && activationModalVisible && (
            <CreateActivationFormModal
              activationModalVisible={activationModalVisible}
              toggleActivationModal={toggleActivationModal}
              pendingActivationEdit={pendingActivationEdit}
              setPendingActivationEdit={setPendingActivationEdit}
              createActivation={createActivation}
              editActivation={editActivation}
              offerID={offerID as OfferID}
              mode={activationModalType}
              activationToEdit={activationToEdit}
            />
          )}

          <Modal
            title="Whitelist Partner to Offer"
            open={addPartnerModalVisible}
            onOk={() => setAddPartnerModalVisible(false)}
            onCancel={() => setAddPartnerModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setAddPartnerModalVisible(false)}>
                Cancel
              </Button>,
            ]}
          >
            <$InfoDescription>
              {`Whitelisted partners will be able to show your video ads in their events. `}
              {'Find partners at the '}
              <Link to="/marketplace/outsource">Outsourcing Marketplace</Link> {` or `}
              <a href="https://lootbox.fyi/3fwaSqj" target="_blank" rel="noreferrer">
                View Tutorial
              </a>
            </$InfoDescription>
            <Input.Search
              placeholder="Search Partner by ID"
              onSearch={(value: string) => {
                getPartner({ variables: { affiliateID: value } });
              }}
              style={{ width: '100%' }}
              enterButton="Search"
            />
            <br />
            <$Horizontal verticalCenter style={{ margin: '20px 0px' }}>
              {loadingPartner && <Spin style={{ margin: 'auto' }} />}
              {!errorPartner && searchedPartner && (
                <div>
                  <Card
                    key={searchedPartner.id}
                    hoverable
                    style={{ flex: 1, maxWidth: '250px' }}
                    cover={
                      <img
                        alt="example"
                        src={searchedPartner.avatar || ''}
                        style={{ width: '250px', height: '150px', objectFit: 'cover' }}
                      />
                    }
                    actions={[
                      <Button
                        type="primary"
                        onClick={async () => {
                          setAddPartnerPending(true);
                          await whitelistAffiliate({
                            variables: {
                              payload: {
                                affiliateID: searchedPartner?.id,
                                offerID,
                                advertiserID,
                                status: OrganizerOfferWhitelistStatus.Active,
                              },
                            },
                          });
                          setAddPartnerPending(false);
                          setAddPartnerModalVisible(false);
                          message.success('Successfully whitelisted this partner to offer');
                        }}
                        key={`view-${searchedPartner.id}`}
                        style={{ width: '80%' }}
                      >
                        {addPartnerPending ? <Spin /> : 'Add'}
                      </Button>,
                    ]}
                  >
                    <Meta
                      title={searchedPartner.name}
                      description={`${formatBigNumber(
                        searchedPartner.audienceSize || 0,
                        1,
                      )} Audience`}
                      style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
                    />
                  </Card>
                </div>
              )}
            </$Horizontal>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default OfferPage;
