import {
  ViewCreatedOfferResponse,
  QueryViewCreatedOfferArgs,
  Offer,
  EditOfferPayload,
  ResponseError,
  MutationEditOfferArgs,
  EditOfferResponseSuccess,
  CreateActivationPayload,
  CreateActivationInput,
  ActivationStatus,
  Activation,
  EditActivationResponseSuccess,
  MutationEditActivationArgs,
  EditActivationInput,
} from '@/api/graphql/generated/types';
import { useMutation, useQuery } from '@apollo/client';
import { Spin, Image, Row, Col, Card, Button, Modal } from 'antd';
import React, { useCallback, useState } from 'react';
import { CREATE_ACTIVATION, EDIT_OFFER, GET_OFFER, EDIT_ACTIVATION } from './api.gql';
import styles from './index.less';
import { useParams } from 'react-router-dom';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';
import { $ColumnGap, $Horizontal, $Vertical } from '@/components/generics';
import CreateOfferForm from '@/components/CreateOfferForm';
import { ActivationID, AdvertiserID, OfferID } from '@wormgraph/helpers';
import CreateActivationFormModal from '@/components/CreateActivationFormModal';
import { EditActivationPayload } from '../../../api/graphql/generated/types';
import {
  CreateActivationResponseSuccess,
  MutationCreateActivationArgs,
} from '../../../api/graphql/generated/types';

const advertiserID = 'p7BpSqP6U4n4NEanEcFt' as AdvertiserID;

const OfferPage: React.FC = () => {
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

  // GET OFFER
  const { data, loading, error } = useQuery<
    { viewCreatedOffer: ViewCreatedOfferResponse },
    QueryViewCreatedOfferArgs
  >(GET_OFFER, {
    variables: { offerID: offerID || '' },
    onCompleted: (data) => {
      if (data?.viewCreatedOffer.__typename === 'ViewCreatedOfferResponseSuccess') {
        const offer = data.viewCreatedOffer.offer;
        console.log(offer);
        setOffer(offer);
      }
    },
  });
  // EDIT OFFER
  const [editOfferMutation] = useMutation<
    { editOffer: ResponseError | EditOfferResponseSuccess },
    MutationEditOfferArgs
  >(EDIT_OFFER, {
    refetchQueries: [{ query: GET_OFFER, variables: { offerID } }],
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

  if (!offerID) {
    return <div>Offer ID not found</div>;
  }
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.viewCreatedOffer.__typename === 'ResponseError') {
    return <span>{data?.viewCreatedOffer.error?.message || ''}</span>;
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
  const editActivation = async (payload: Omit<EditActivationInput, 'offerID'>) => {
    if (!activationToEdit) return;
    const res = await editActivationMutation({
      variables: {
        payload: {
          activationID: activationToEdit.id as ActivationID,
          activation: {
            name: payload.name,
            description: payload.description || '',
            pricing: payload.pricing,
            status: payload.status,
            mmpAlias: payload.mmpAlias,
            id: activationToEdit.id as ActivationID,
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
  const breadLine = [
    { title: 'Manage', route: '/manage' },
    { title: 'Offers', route: '/manage/offers' },
    { title: offer?.title || '', route: `/manage/offers/id/${offer?.id}` },
  ];
  const gridStyle: React.CSSProperties = {
    flex: '100%',
  };
  const maxWidth = '1000px';
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
                advertiserID: (offer.advertiserID as AdvertiserID) || advertiserID,
                maxBudget: offer.maxBudget || 0,
                startDate: offer.startDate,
                endDate: offer.endDate,
                status: offer.status,
                affiliateBaseLink: offer.affiliateBaseLink || '',
                mmp: offer.mmp,
              }}
              onSubmit={editOffer}
              mode="view-edit"
            />
            <$ColumnGap />
            <Image width={200} src={offer.image || ''} />
          </$Horizontal>
          <br />
          <$Horizontal justifyContent="space-between">
            <h2>Activations</h2>
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
            {(offer.activations || [])
              .slice()
              .sort((a, b) => (a.status === ActivationStatus.Active ? -1 : 1))
              .map((activation) => {
                return (
                  <Card.Grid key={activation.id} style={gridStyle}>
                    <Row
                      style={activation.status !== ActivationStatus.Active ? { opacity: 0.2 } : {}}
                    >
                      <Col span={16}>
                        {activation.name}{' '}
                        {activation.status !== ActivationStatus.Active
                          ? ` (${activation.status})`
                          : ''}
                      </Col>
                      <Col span={4} style={{ textAlign: 'right' }}>
                        ${activation.pricing}
                      </Col>
                      <Col span={4} style={{ textAlign: 'right' }}>
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
        </div>
      )}
    </div>
  );
};

export default OfferPage;
