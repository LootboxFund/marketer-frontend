import { Avatar, List, Switch } from 'antd';
import { $Horizontal, $Vertical, $ColumnGap } from '@/components/generics';
import styles from './index.less';
import { useEffect, useState } from 'react';
import {
  BorderOutlined,
  CheckCircleFilled,
  CheckOutlined,
  PlayCircleFilled,
  TrophyFilled,
} from '@ant-design/icons';
import { useAdvertiserUser } from '../AuthGuard/advertiserUserInfo';

export type QuickStartChecklistProps = {};

const data = [
  {
    title: 'Watch the Getting Started Video',
    description: 'Get a quick overview of the platform and learn how to get started.',
    tutorial: 'https://lootbox.fund',
    isAdvanced: false,
    key: 'watch-getting-started-video',
  },
  {
    title: 'Fill Out Your Profile',
    description: 'Customize your profile to attract partners to promote or run your events.',
    tutorial: 'https://youtu.be/mBgjHVqkCXM',
    examples: 'https://youtu.be/mBgjHVqkCXM',
    action: '/dashboard/getting-started',
    isAdvanced: true,
    key: 'fill-out-profile',
  },
  {
    title: 'Create an Offer',
    description: 'Offers are promotional incentives to attract new users.',
    tutorial: 'https://youtu.be/ziJPOLHM3Pk',
    examples: 'https://youtu.be/ziJPOLHM3Pk',
    action: '/manage/offers/create',
    isAdvanced: false,
    key: 'create-an-offer',
  },
  {
    title: 'Define an Activation',
    description: 'Activations are specific events you want to see happen.',
    tutorial: 'https://youtu.be/bCJYSNXxlQw',
    examples: 'https://youtu.be/bCJYSNXxlQw',
    isAdvanced: true,
    key: 'define-an-activation',
  },
  {
    title: 'Create an Ad',
    description: 'Deliver your message with a video or image ad shown on Lootbox tickets.',
    tutorial: 'https://youtu.be/JGKAMEdIEr8',
    examples: 'https://youtu.be/JGKAMEdIEr8',
    action: '/manage/ads/create',
    isAdvanced: false,
    key: 'create-an-ad',
  },
  {
    title: 'Preload Your Wallet',
    description: 'Connect your wallet and preload funds to pay for ads.',
    tutorial: 'https://lootbox.fyi/3T8aJqC',
    action: '/company/account',
    isAdvanced: true,
    key: 'preload-wallet',
  },
  {
    title: 'Recruit Partners',
    description:
      'Recruit influencers, streamers and gaming communities to help promoter or run your events.',
    tutorial: 'https://youtu.be/QRxctZJ5uRI',
    examples: 'https://youtu.be/QRxctZJ5uRI',
    action: '/marketplace/outsource',
    isAdvanced: false,
    key: 'recruit-partners',
  },
  {
    title: 'Share Free Tickets',
    description:
      'Distribute Lootbox tickets to community members so that your offer can attract new customers.',
    tutorial: 'https://lootbox.fyi/3EUxhGc',
    examples: 'https://lootbox.fyi/3EUxhGc',
    isAdvanced: false,
    key: 'share-free-tickets',
  },
  {
    title: 'View Ticket Performance',
    description: 'Review analytics on offer conversions & ticket distribution from partners. ',
    tutorial: 'https://lootbox.fyi/3B90hZL',
    isAdvanced: true,
    key: 'view-ticket-performance',
  },
  {
    title: 'Meet the LOOTBOX Team',
    description: 'Schedule a call with the LOOTBOX team to meet your account manager.',
    isAdvanced: true,
    key: 'meet-lootbox-team',
    action: 'https://lootbox.fyi/3XX8dr6',
  },
];

const emptyToDoList: Record<string, boolean> = data.reduce(
  (acc, curr) => {
    return {
      ...acc,
      [curr.key]: false,
    };
  },
  { isAdvancedMode: false },
);

const QuickStartChecklist: React.FC<QuickStartChecklistProps> = ({}) => {
  const { advertiserUser } = useAdvertiserUser();
  const { id: advertiserID } = advertiserUser;
  const TODO_LIST = `todo-list-advertiser-${advertiserID}`;
  const [todoStatuses, setTodoStatuses] = useState(emptyToDoList);
  useEffect(() => {
    // @ts-ignore
    const todo = JSON.parse(localStorage.getItem(TODO_LIST));
    if (todo) {
      setTodoStatuses(todo);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(TODO_LIST, JSON.stringify(todoStatuses));
  }, [todoStatuses]);
  return (
    <section>
      <$Horizontal>
        <$Vertical style={{ flex: 2 }}>
          <$Horizontal justifyContent="space-between">
            <h1
              style={{
                fontSize: '1.5rem',
                color: '#1A1A1A',
                fontWeight: 'bold',
              }}
            >
              {`Getting Started with LOOTBOX`}
            </h1>
            <$Horizontal>
              <span
                style={{
                  color: 'gray',
                  marginRight: '10px',
                  fontWeight: 600,
                }}
              >
                {todoStatuses.isAdvancedMode ? 'Advanced' : 'Simple'}
              </span>
              <Switch
                checked={todoStatuses.isAdvancedMode}
                onChange={() => {
                  setTodoStatuses({
                    ...todoStatuses,
                    isAdvancedMode: !todoStatuses.isAdvancedMode,
                  });
                }}
              />
            </$Horizontal>
          </$Horizontal>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(0,0,0,0.65)',
              lineHeight: '22px',
              marginTop: 16,
              marginBottom: 32,
              width: '70%',
            }}
          >
            {todoStatuses.isAdvancedMode
              ? `Grow your community with friendly online competitions in collaboration with gaming communities, influencers, and content creators. LOOTBOX helps you scale community building globally. Watch the below tutorial videos to get started.`
              : `Grow your community with friendly online competitions in collaboration with gaming communities, influencers, and content creators. Watch the below tutorial videos to get started.`}
          </p>
        </$Vertical>
        {/* <$Vertical style={{ flex: 1 }}>
          <iframe
            className={styles.video}
            width="100%"
            src="https://www.youtube.com/embed/MxQ0Z6CF91g"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </$Vertical> */}
      </$Horizontal>
      <br />
      <List
        itemLayout="horizontal"
        dataSource={data.filter((d) => (todoStatuses.isAdvancedMode ? true : !d.isAdvanced))}
        renderItem={(item, i) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                todoStatuses[item.key] ? (
                  <CheckCircleFilled
                    onClick={() =>
                      setTodoStatuses({
                        ...todoStatuses,
                        [item.key]: !todoStatuses[item.key],
                      })
                    }
                    style={{ color: 'green', fontSize: '2rem', cursor: 'pointer' }}
                  />
                ) : (
                  <CheckCircleFilled
                    onClick={() =>
                      setTodoStatuses({
                        ...todoStatuses,
                        [item.key]: !todoStatuses[item.key],
                      })
                    }
                    style={{ color: 'rgba(0,0,0,0.1)', fontSize: '2rem', cursor: 'pointer' }}
                  />
                )
              }
              title={
                item.action ? <a href={item.action}>{item.title}</a> : <span>{item.title}</span>
              }
              description={item.description}
            />
            <$Horizontal style={{ width: '250px' }}>
              <a href={item.tutorial} target="_blank" rel="noreferrer">
                <PlayCircleFilled />
                {` Watch Tutorial`}
              </a>
              <$ColumnGap width="30px" />
              {item.examples && (
                <a href={item.examples} target="_blank" rel="noreferrer">
                  <TrophyFilled />
                  {` See Examples`}
                </a>
              )}
            </$Horizontal>
          </List.Item>
        )}
      />
    </section>
  );
};

export default QuickStartChecklist;
