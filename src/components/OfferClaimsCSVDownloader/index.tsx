import { Button, message, notification } from 'antd';
import { useMutation } from '@apollo/client';
import { MutationOfferClaimsCsvArgs } from '@/api/graphql/generated/types';
import { OfferClaimsCSVResponseFE, OFFER_CLAIMS } from './api.gql';
import { OfferID } from '@wormgraph/helpers';
import { ButtonType } from 'antd/lib/button';

export type OfferCSVDownloaderProps = {
  offerID: OfferID;
  text?: string;
  type?: ButtonType;
};
const OfferClaimsCSVDownloader: React.FC<OfferCSVDownloaderProps> = (props) => {
  const [generateClaimsCSV, { loading: loadingClaimerCSVData }] = useMutation<
    OfferClaimsCSVResponseFE,
    MutationOfferClaimsCsvArgs
  >(OFFER_CLAIMS);

  const handleClaimsCSV = async () => {
    if (loadingClaimerCSVData) return;
    const loadingMessge = message.loading('Generating CSV file...', 0);
    try {
      const { data } = await generateClaimsCSV({
        variables: {
          payload: {
            offerID: props.offerID,
          },
        },
      });

      if (data?.offerClaimsCSV.__typename === 'ResponseError') {
        throw new Error(data.offerClaimsCSV.error.message);
      }

      loadingMessge();
      notification.success({
        message: 'CSV file generated successfully',
        placement: 'top',
        duration: 0,
        description: (
          <a
            href={
              data && 'csvDownloadURL' in data?.offerClaimsCSV
                ? data?.offerClaimsCSV.csvDownloadURL
                : undefined
            }
            download
            style={{ fontStyle: 'italic' }}
          >
            <br />
            <Button type="primary">Download CSV</Button>
          </a>
        ),
      });
    } catch (e: any) {
      loadingMessge();
      message.error(e?.message || 'An error occured');
    }
  };

  return (
    <Button type={props.type || 'ghost'} loading={loadingClaimerCSVData} onClick={handleClaimsCSV}>
      {props.text || 'Download'}
    </Button>
  );
};

export default OfferClaimsCSVDownloader;
