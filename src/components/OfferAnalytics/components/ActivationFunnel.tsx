import { QueryOfferActivationsArgs } from '@/api/graphql/generated/types';
import { Funnel, FunnelConfig } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { OfferID } from '@wormgraph/helpers';
import { Button, Card, Col, Empty, Result, Row, Statistic, Tooltip } from 'antd';
import { useMemo } from 'react';
import styled from 'styled-components';
import { OfferActivationsFE, OFFER_ACTIVATIONS } from '../api.gql';
import DummyFunnel from './DummyFunnel';
import OfferClaimsCSVDownloader from '../../OfferClaimsCSVDownloader';
import { $InfoDescription } from '@/components/generics';

interface EventActivationFunnelProps {
  offerID: OfferID;
  openInviteParterModal: () => void;
}

const YDataLabel = 'activationName';
const XDataLabel = 'adEventCount';

const dummydata = [
  {
    [XDataLabel]: 'Demo Top Of Funnel Activation',
    [YDataLabel]: 183,
  },
  {
    [XDataLabel]: 'Demo Middle Of Funnel Activation',
    [YDataLabel]: 87,
  },
  {
    [XDataLabel]: 'Demo Bottom Of Funnel Activation',
    [YDataLabel]: 59,
  },
];

const EventActivationFunnel: React.FC<EventActivationFunnelProps> = (props) => {
  const { data, loading, error } = useQuery<OfferActivationsFE, QueryOfferActivationsArgs>(
    OFFER_ACTIVATIONS,
    {
      variables: {
        payload: {
          offerID: props.offerID,
        },
      },
    },
  );

  const { data: parsedData } = useMemo(() => {
    if (!data?.offerActivations || data?.offerActivations?.__typename === 'ResponseError') {
      return {
        data: [],
      };
    }

    return {
      data:
        'data' in data.offerActivations
          ? data.offerActivations.data.map((row) => {
              return {
                [XDataLabel]: row.activationName,
                [YDataLabel]: row.adEventCount,
                description: row.activationDescription,
              };
            })
          : [],
    };
  }, [data?.offerActivations]);

  const config: FunnelConfig = {
    data: parsedData,
    xField: XDataLabel,
    yField: YDataLabel,
    legend: false,
    shape: 'pyramid',
    loading,
  };

  const isEmptyData =
    !loading && (parsedData.length === 0 || parsedData.every((row) => row[YDataLabel] === 0));

  if (error || data?.offerActivations?.__typename === 'ResponseError') {
    return (
      <Result
        status="error"
        title="An error occured"
        subTitle="We can't load that data right now. Please try again later."
      />
    );
  }

  return (
    <div>
      <Row justify="space-between">
        <h2>Activation Funnel</h2>
        <OfferClaimsCSVDownloader text="Download CSV" offerID={props.offerID} />
      </Row>
      <$InfoDescription style={{ textAlign: 'start' }}>
        A funnel of your event's activations showing you how many conversions have been driven thus
        far.{' '}
        {isEmptyData
          ? 'Your offer has no activation conversions yet. Invite Partners to your offer to drive activation conversions.'
          : ''}
        {isEmptyData && (
          <Button
            type="link"
            onClick={props.openInviteParterModal}
            style={{ paddingLeft: '0px', fontSize: '1rem' }}
          >
            Invite Partners.
          </Button>
        )}
      </$InfoDescription>

      <Row>
        <Col
          sm={24}
          md={18}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {isEmptyData ? (
            <$FunnelContainer>
              <DummyFunnel />
            </$FunnelContainer>
          ) : (
            <$FunnelContainer>
              <Funnel {...config} />
              {/* <Button onClick={props.openInviteParterModal}>Download CSV</Button> */}
            </$FunnelContainer>
          )}
        </Col>
        <Col
          sm={24}
          md={6}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {loading
            ? [
                <Statistic key="loading1" loading={true} />,
                <Statistic key="loading2" loading={true} />,
                <Statistic key="loading3" loading={true} />,
              ]
            : (parsedData?.length > 0 ? parsedData : dummydata).map((row, idx) => {
                return (
                  <Tooltip
                    key={`Statistic${idx}`}
                    placement="top"
                    title={`You define monetizable activation events for this offer. Tournament hosts and affiliates will promote your offer for you! See how many conversions have been driven here.`}
                  >
                    <Statistic loading={loading} title={row[XDataLabel]} value={row[YDataLabel]} />
                  </Tooltip>
                );
              })}
        </Col>
      </Row>
    </div>
  );
};

const $FunnelContainer = styled.div``;

export default EventActivationFunnel;
