import type {
  Conquest,
  GetConquestResponse,
  MutationUpdateConquestArgs,
  QueryGetConquestArgs,
  ResponseError,
  TournamentPreview,
  UpdateConquestPayload,
  UpdateConquestResponseSuccess,
} from '@/api/graphql/generated/types';
import BreadCrumbDynamic from '@/components/BreadCrumbDynamic';
import CreateCampaignForm from '@/components/CreateCampaignForm';
import { $Horizontal } from '@/components/generics';
import { DeleteOutlined, EyeOutlined, FolderAddOutlined } from '@ant-design/icons';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { Link } from '@umijs/max';
import { AdvertiserID } from '@wormgraph/helpers';
import { Button, Card, Empty, Image, Input, Modal, Popconfirm, Skeleton } from 'antd';
import Meta from 'antd/lib/card/Meta';
import Spin from 'antd/lib/spin';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { LIST_CONQUEST_PREVIEWS } from '../CampaignsPage/api.gql';
import { GET_CONQUEST, GET_TOURNAMENT, UPDATE_CONQUEST } from './api.gql';
import styles from './index.less';
import { Tournament } from '../../../api/graphql/generated/types';
import { useAdvertiserUser } from '@/components/AuthGuard/advertiserUserInfo';

const CampaignPage: React.FC = () => {
  const { campaignID } = useParams();

  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  const [conquest, setConquest] = useState<Conquest>();
  const [tournamentPreviews, setTournamentPreviews] = useState<TournamentPreview[]>([]);

  const [addTournamentModalVisible, setAddTournamentModalVisible] = useState(false);
  const [addTournamentPending, setAddTournamentPending] = useState(false);
  const [searchString, setSearchString] = useState('');
  // GET CONQUEST
  const { data, loading, error } = useQuery<
    { getConquest: GetConquestResponse },
    QueryGetConquestArgs
  >(GET_CONQUEST, {
    variables: { advertiserID, conquestID: campaignID || '' },
    onCompleted: (data) => {
      if (data?.getConquest.__typename === 'GetConquestResponseSuccess') {
        const conquest = data.getConquest.conquest;
        const tournaments = data.getConquest.tournaments;
        setConquest(conquest);
        setTournamentPreviews(tournaments);
      }
    },
  });
  // UPDATE CONQUEST
  const [updateConquestMutation] = useMutation<
    { updateConquest: ResponseError | UpdateConquestResponseSuccess },
    MutationUpdateConquestArgs
  >(UPDATE_CONQUEST, {
    refetchQueries: [
      { query: GET_CONQUEST, variables: { advertiserID, conquestID: campaignID || '' } },
      { query: LIST_CONQUEST_PREVIEWS, variables: { advertiserID } },
    ],
  });
  // LAZY GET TOURNAMENT
  const [
    getTournament,
    { loading: loadingTournament, error: errorTournament, data: dataTournament },
  ] = useLazyQuery(GET_TOURNAMENT);
  if (!campaignID) {
    return <span>Campaign ID not found</span>;
  }
  const updateConquest = async (payload: Omit<UpdateConquestPayload, 'id'>) => {
    console.log(`Updating...`);
    const res = await updateConquestMutation({
      variables: {
        payload: {
          ...payload,
          id: campaignID,
        },
        advertiserID: advertiserID,
      },
    });
    console.log(res);
    if (!res?.data || res?.data?.updateConquest?.__typename === 'ResponseError') {
      // @ts-ignore
      throw new Error(res?.data?.updateConquest?.error?.message || words.anErrorOccured);
    }
  };
  if (error) {
    return <span>{error?.message || ''}</span>;
  } else if (data?.getConquest.__typename === 'ResponseError') {
    return <span>{data?.getConquest.error?.message || ''}</span>;
  }
  const breadLine = [
    { title: 'Dashboard', route: '/dashboard' },
    { title: 'Campaigns', route: '/dashboard/campaigns' },
    { title: conquest?.title || '', route: `/dashboard/campaigns/id/${conquest?.id}` },
  ];

  const filterBySearchString = (tournament: TournamentPreview) => {
    return (
      tournament.id.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
      tournament.title.toLowerCase().indexOf(searchString.toLowerCase()) > -1
    );
  };
  const searchedTournament = dataTournament?.tournament.tournament;
  const maxWidth = '1000px';
  return (
    <div>
      {loading || !conquest ? (
        <div className={styles.loading_container}>
          <Spin />
        </div>
      ) : (
        <div className={styles.content}>
          <BreadCrumbDynamic breadLine={breadLine} />
          <h1>{conquest.title}</h1>
          <br />
          <$Horizontal style={{ maxWidth }}>
            <CreateCampaignForm
              conquest={{
                title: conquest.title || '',
                description: conquest.description || '',
                startDate: conquest.startDate || 0,
                endDate: conquest.endDate || 0,
                status: conquest.status,
              }}
              advertiserID={advertiserID as AdvertiserID}
              onSubmit={updateConquest}
              mode="view-edit"
            />
            <Image width={200} src={conquest.image || ''} />
          </$Horizontal>
          <br />
          <br />
          <h2>Tournaments</h2>
          <$Horizontal justifyContent="space-between" style={{ maxWidth }}>
            <Input.Search
              placeholder="Find Tournament"
              allowClear
              onChange={(e) => setSearchString(e.target.value)}
              onSearch={setSearchString}
              style={{ width: 200 }}
            />
            <Button
              type="link"
              onClick={() => {
                setAddTournamentModalVisible(true);
              }}
              style={{ alignSelf: 'flex-end' }}
            >
              Add Tournament
            </Button>
          </$Horizontal>
          <br />
          {tournamentPreviews.length > 0 ? (
            <div className={styles.tournaments_grid}>
              {tournamentPreviews.filter(filterBySearchString).map((tp) => {
                return (
                  <Card
                    key={tp.id}
                    hoverable
                    className={styles.card}
                    cover={
                      <img
                        className={styles.cardImage}
                        alt="tournament photo"
                        src={tp.coverPhoto || ''}
                      />
                    }
                    actions={[
                      <Link
                        key={`view-${conquest.id}`}
                        to={`/dashboard/events/id/${tp.id}`}
                        target="_blank"
                      >
                        <EyeOutlined key="view" />
                      </Link>,
                      <Popconfirm
                        key={`remove-${conquest.id}`}
                        title="Are you sure to remove this tournament from your campaign?"
                        onConfirm={async (e) => {
                          console.log(e);
                          await updateConquest({
                            tournaments: conquest.tournaments.filter((t) => t !== tp.id),
                          });
                        }}
                        okText="Yes"
                        cancelText="No"
                      >
                        <DeleteOutlined key="delete" />
                      </Popconfirm>,
                    ]}
                  >
                    <Meta
                      title={tp.title}
                      style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
                    />
                  </Card>
                );
              })}
            </div>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      )}
      <Modal
        title="Add Tournament to Campaign"
        open={addTournamentModalVisible}
        onOk={() => setAddTournamentModalVisible(false)}
        onCancel={() => setAddTournamentModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setAddTournamentModalVisible(false)}>
            Cancel
          </Button>,
        ]}
      >
        <Input.Search
          placeholder="Search Tournament by ID"
          onSearch={(value: string) => {
            getTournament({ variables: { tournamentID: value } });
          }}
          style={{ width: '100%' }}
          enterButton="Search"
        />
        <br />
        <$Horizontal verticalCenter style={{ margin: '20px 0px' }}>
          {loadingTournament && <Spin style={{ margin: 'auto' }} />}
          {!errorTournament && searchedTournament && (
            <div>
              <Card
                key={searchedTournament.id}
                hoverable
                style={{ flex: 1, maxWidth: '250px' }}
                cover={
                  <img
                    alt="example"
                    src={searchedTournament.coverPhoto || ''}
                    style={{ width: '250px', height: '150px', objectFit: 'cover' }}
                  />
                }
                actions={[
                  <Link
                    key={`view-${searchedTournament.id}`}
                    to={`/dashboard/events/id/${searchedTournament.id}`}
                    target="_blank"
                  >
                    <Button style={{ width: '80%' }}>View</Button>
                  </Link>,
                  <Button
                    type="primary"
                    onClick={async () => {
                      if (conquest) {
                        setAddTournamentPending(true);
                        await updateConquest({
                          tournaments: [...conquest.tournaments, searchedTournament.id],
                        });
                        setAddTournamentPending(false);
                        setAddTournamentModalVisible(false);
                      }
                    }}
                    key={`view-${searchedTournament.id}`}
                    style={{ width: '80%' }}
                  >
                    {addTournamentPending ? <Spin /> : 'Add'}
                  </Button>,
                ]}
              >
                <Meta
                  title={searchedTournament.title}
                  style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
                />
              </Card>
            </div>
          )}
        </$Horizontal>
      </Modal>
    </div>
  );
};

export default CampaignPage;
