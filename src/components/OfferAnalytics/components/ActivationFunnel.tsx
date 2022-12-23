import { QueryOfferActivationsArgs } from '@/api/graphql/generated/types';
import { Funnel, FunnelConfig } from '@ant-design/plots';
import { useQuery } from '@apollo/client';
import { OfferID } from '@wormgraph/helpers';
import { Button, Card, Col, Empty, Result, Row, Statistic, Tooltip } from 'antd';
import { useMemo } from 'react';
import { OfferActivationsFE, OFFER_ACTIVATIONS } from '../api.gql';

interface EventActivationFunnelProps {
  offerID: OfferID;
  openInviteParterModal: () => void;
}

const YDataLabel = 'activationName';
const XDataLabel = 'adEventCount';

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

  if (isEmptyData) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        imageStyle={{
          height: 60,
        }}
        description={
          <span style={{ maxWidth: '200px' }}>
            {`Your offer has no activations yet. Invite Partners to your offer to drive activation conversions.`}
          </span>
        }
        style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '50px' }}
      >
        <Button onClick={props.openInviteParterModal}>Invite Partner</Button>
      </Empty>
    );
  }

  return (
    <Card>
      {/* <h2>Activation Funnel</h2>
      <$InfoDescription>
        Promote fan tickets for your event to increase revenue and earn commission on successful
        conversions for this offer. Monetize your platform and provide value to followers.
      </$InfoDescription> */}
      <Row>
        <Col
          sm={24}
          md={isEmptyData ? 24 : 18}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Funnel {...config} />
        </Col>
        {!isEmptyData && (
          <Col
            sm={24}
            md={6}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {loading && [
              <Statistic key="loading1" loading={true} />,
              <Statistic key="loading2" loading={true} />,
              <Statistic key="loading3" loading={true} />,
            ]}
            {parsedData.map((row, idx) => {
              return (
                <Tooltip
                  key={`Statistic${idx}`}
                  placement="top"
                  title={`This is a monetizable activation for this offer. See how many activations have been driven here. Add more activations above.`}
                >
                  <Statistic loading={loading} title={row[XDataLabel]} value={row[YDataLabel]} />
                </Tooltip>
              );
            })}
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default EventActivationFunnel;
