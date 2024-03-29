import { OfferPreview, OfferStatus, Placement } from '@/api/graphql/generated/types';
import { OfferID, OfferStrategyToAdPlacementConverter } from '@wormgraph/helpers';
import { Avatar, Transfer } from 'antd';
import type { TransferDirection } from 'antd/es/transfer';
import React, { useEffect, useMemo, useState } from 'react';
import { $Horizontal } from '@/components/generics';
import { Link } from '@umijs/max';
import { EyeOutlined } from '@ant-design/icons';

interface AdSetToOfferPickerProps {
  listOfOffers: OfferPreview[];
  chosenOffers: React.MutableRefObject<OfferID[]>;
  disabled: boolean;
  initialSelectedKeys?: OfferID[];
  chosenPlacement: Placement;
}
const AdSetToOfferPicker: React.FC<AdSetToOfferPickerProps> = ({
  listOfOffers,
  chosenOffers,
  disabled,
  initialSelectedKeys,
  chosenPlacement,
}) => {
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [searchString, setSearchString] = useState<string>('');

  useEffect(() => {
    if (initialSelectedKeys && initialSelectedKeys.length > 0) {
      setSelectedKeys(initialSelectedKeys);
      setTargetKeys(initialSelectedKeys);
    }
  }, []);

  const handleChange = (
    newTargetKeys: string[],
    direction: TransferDirection,
    moveKeys: string[],
  ) => {
    // setTargetKeys(newTargetKeys);
    // chosenOffers.current = newTargetKeys as OfferID[];
    // only allow 1 to be selected
    setTargetKeys([newTargetKeys[0]]);
    chosenOffers.current = [newTargetKeys[0]] as OfferID[];
  };

  const handleSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const handleScroll = (
    direction: TransferDirection,
    e: React.SyntheticEvent<HTMLUListElement, Event>,
  ) => {
    // console.log('direction:', direction);
    // console.log('target:', e.target);
  };
  const offersListToSplice = useMemo(() => {
    return listOfOffers.slice().sort((a, b) => {
      return a.status === OfferStatus.Archived ||
        OfferStrategyToAdPlacementConverter[a.strategy] != chosenPlacement
        ? 1
        : -1;
    });
  }, [listOfOffers]);
  const offersToShow = offersListToSplice.map((offer) => {
    return {
      key: offer.id,
      title: offer.title,
      thumbnail: offer.image,
      disabled:
        offer.status === OfferStatus.Archived ||
        OfferStrategyToAdPlacementConverter[offer.strategy] != chosenPlacement,
    };
  });

  return (
    <>
      <Transfer
        disabled={disabled}
        dataSource={offersToShow}
        titles={['Select Options', 'Appears in these Offers']}
        targetKeys={targetKeys}
        selectedKeys={selectedKeys}
        showSearch
        onChange={handleChange}
        onSelectChange={handleSelectChange}
        onScroll={handleScroll}
        onSearch={(_: any, value: any) => {
          setSearchString(value);
        }}
        filterOption={(input: any, option: any) => {
          return (
            option.key.toLowerCase().indexOf(searchString.toLowerCase()) > -1 ||
            option.title.toLowerCase().indexOf(searchString.toLowerCase()) > -1
          );
        }}
        render={(item) => {
          return (
            <$Horizontal key={item.key} verticalCenter justifyContent="space-between">
              <$Horizontal verticalCenter>
                <Avatar shape="square" size="large" src={item.thumbnail} />
                <span style={{ paddingLeft: '10px', fontSize: '1rem' }}>{item.title}</span>
              </$Horizontal>
              <Link to={`/manage/offers/id/${item.key}`} target="_blank">
                <EyeOutlined onClick={(e) => e.stopPropagation()} style={{ color: '#a3a3a3' }} />
              </Link>
            </$Horizontal>
          );
        }}
        oneWay
        style={{ marginBottom: 16 }}
        listStyle={{ width: '350px', minWidth: '350px', height: '500px' }}
      />
    </>
  );
};

export default AdSetToOfferPicker;
