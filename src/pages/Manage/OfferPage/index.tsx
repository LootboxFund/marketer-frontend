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
  OrganizerOfferWhitelist,
  OrganizerOfferWhitelistWithProfile,
  OrganizerOfferWhitelistStatus,
  EditWhitelistAffiliateToOfferResponse,
  MutationEditWhitelistAffiliateToOfferArgs,
} from '@/api/graphql/generated/types';
import { ActivationStatus } from '@/api/graphql/generated/types';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { Spin, Image, Row, Col, Card, Button, Modal, Input, Switch } from 'antd';
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
import { $ColumnGap, $Horizontal, $Vertical, placeholderImage } from '@/components/generics';
import CreateOfferForm from '@/components/CreateOfferForm';
import type { ActivationID, AdvertiserID, OfferID } from '@wormgraph/helpers';
import CreateActivationFormModal from '@/components/CreateActivationFormModal';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { LIST_CREATED_OFFERS } from '../OffersPage/api.gql';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';
import { AdSetStatus } from '../../../api/graphql/generated/types';
import { Link } from '@umijs/max';
import Meta from 'antd/lib/card/Meta';
import { LIST_PARTNERS } from '../PartnersPage/api.gql';

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
    const res = await editOfferMutation({
      variables: {
        payload: {
          id: offerID,
          advertiserID,
          title: payload.title,
          description: payload.description,
          image: payload.image,
          maxBudget: payload.maxBudget,
          startDate: payload.startDate,
          endDate: payload.endDate,
          status: payload.status,
        },
      },
    });
    if (!res?.data || res?.data?.editOffer?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.editOffer?.error?.message || words.anErrorOccured);
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
            mmpAlias: payload.mmpAlias,
            offerID: offerID as OfferID,
          },
        },
      },
    });
    if (!res?.data || res?.data?.createActivation?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.createActivation?.error?.message || words.anErrorOccured);
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
            mmpAlias: payload.mmpAlias,
            id: activationID,
            order: payload.order,
          },
        },
      },
    });
    if (!res?.data || res?.data?.editActivation?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.editActivation?.error?.message || words.anErrorOccured);
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
          <br />
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
              }}
              advertiserID={advertiserID as AdvertiserID}
              onSubmit={editOffer}
              mode="view-edit"
            />
            <$ColumnGap />
            <Image width={200} src={offer.image || ''} />
          </$Horizontal>
          <br />
          <$Horizontal justifyContent="space-between">
            <h2>Activation Funnel</h2>
            <Button
              type="link"
              onClick={() => {
                setActivationModalType('create');
                setActivationModalVisible(true);
              }}
              style={{ alignSelf: 'flex-end' }}
            >
              Add Activation
            </Button>
          </$Horizontal>
          <br />
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
                          setActivationModalVisible(true);
                          setActivationToEdit(activation);
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
          <br />
          <br />
          <$Horizontal justifyContent="space-between">
            <h2>Allowed Partners</h2>
            <Button
              type="link"
              onClick={() => {
                setAddPartnerModalVisible(true);
              }}
              style={{ alignSelf: 'flex-end' }}
            >
              Add Partner
            </Button>
          </$Horizontal>
          <br />
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
                          await updateWhitelist({
                            variables: {
                              payload: {
                                id: whitelist.whitelist.id,
                                status: checked
                                  ? OrganizerOfferWhitelistStatus.Active
                                  : OrganizerOfferWhitelistStatus.Inactive,
                                advertiserID,
                                affiliateID: whitelist.organizer.id,
                                offerID: whitelist.whitelist.offerID,
                              },
                            },
                          });
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
          <br />
          <br />
          <h2>Ad Sets</h2>
          <br />
          <div className={styles.adSetGrid}>
            {adSetPreviewsSorted.map((adSet) => {
              const imageToDisplay = adSet.thumbnail || placeholderImage;
              return (
                <Link key={adSet.id} to={`/manage/adsets/id/${adSet.id}`}>
                  <Card
                    hoverable
                    className={styles.card}
                    cover={<img alt="example" src={imageToDisplay} className={styles.cardImage} />}
                  >
                    <Meta title={adSet.name} />
                  </Card>
                </Link>
              );
            })}
          </div>
          <br />
          <br />
          {activationModalType && (
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
