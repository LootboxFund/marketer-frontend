import {
  AdvertiserID,
  AffiliateID,
  ConquestStatus,
  MeasurementPartnerType,
  OfferStatus,
} from '@wormgraph/helpers';
import moment from 'moment';
import type { Moment } from 'moment';
import FormBuilder from 'antd-form-builder';
import { Button, Card, Form, Modal } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CreateOfferPayload,
  CreateTournamentPayload,
  EditOfferPayload,
  EditTournamentPayload,
} from '@/api/graphql/generated/types';
import { AntUploadFile, DateView, PriceInput, PriceView } from '../AntFormBuilder';
import { $Horizontal } from '@/components/generics';
import { Rule } from 'antd/lib/form';

export type CreateEventFormProps = {
  tournament: {
    id: string;
    title: string;
    description?: string;
    tournamentDate?: number;
    tournamentLink?: string;
    coverPhoto?: string;
    magicLink?: string;
    prize?: string;
    communityURL?: string;
  };
  mode: 'view-only';
};

const TOURNAMENT_INFO = {
  id: '',
  title: '',
  description: '',
  tournamentDate: moment(new Date()),
  tournamentLink: '',
  coverPhoto: '',
  magicLink: '',
  prize: '',
  communityURL: '',
};
const CreateEventForm: React.FC<CreateEventFormProps> = ({ tournament, mode }) => {
  const newMediaDestination = useRef('');
  const [previewMedias, setPreviewMedias] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState(true);
  const [pending, setPending] = useState(false);
  const [tournamentInfo, setTournamentInfo] = useState(TOURNAMENT_INFO);

  useEffect(() => {
    if (tournament) {
      setTournamentInfo({
        id: tournament.id,
        title: tournament.title,
        description: tournament.description || '',
        tournamentDate: moment(tournament.tournamentDate) || moment(new Date()),
        tournamentLink: tournament.tournamentLink || '',
        coverPhoto: tournament.coverPhoto || '',
        magicLink: tournament.magicLink || '',
        prize: tournament.prize || '',
        communityURL: tournament.communityURL || '',
      });
    }
  }, [tournament]);
  const getMeta = () => {
    const meta = {
      columns: 1,
      disabled: pending,
      initialValues: tournamentInfo,
      fields: [
        { key: 'title', label: 'Title', required: true },
        {
          key: 'tournamentDate',
          label: 'Estimated Date',
          widget: 'date-picker',
          viewWidget: DateView,
          required: true,
        },
        {
          key: 'tournamentLink',
          label: 'Link to Tournament',
          rules: [{ type: 'url' } as Rule],
        },
        { key: 'communityURL', label: 'Link to Community', rules: [{ type: 'url' } as Rule] },
        { key: 'prize', label: 'Prize' },
        // { key: 'magicLink', label: 'Magic Link', rules: [{ type: 'url' } as Rule] },
        { key: 'description', label: 'Description', widget: 'textarea' },
        { key: 'id', label: 'Event ID' },
      ],
    };
    return meta;
  };
  return (
    <Card style={{ flex: 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Form layout="horizontal" form={form}>
          <FormBuilder form={form} meta={getMeta()} viewMode={viewMode} />
        </Form>
      </div>
    </Card>
  );
};

export default CreateEventForm;
