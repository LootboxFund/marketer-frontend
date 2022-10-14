import { GithubOutlined, TwitterOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear} Produced by Lootbox Fund Corporation`}
      links={[
        {
          key: 'LOOTBOX',
          title: 'LOOTBOX',
          href: 'https://twitter.com/LootboxFund',
          blankTarget: true,
        },
        {
          key: 'twitter',
          title: <TwitterOutlined />,
          href: 'https://twitter.com/LootboxFund',
          blankTarget: true,
        },
        {
          key: 'sayhi',
          title: 'Beta Version 0.2',
          href: 'https://lootbox.fund',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
