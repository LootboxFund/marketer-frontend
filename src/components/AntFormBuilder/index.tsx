import type { Moment } from 'moment';
import { Button, Col, InputNumber, message, notification, Row, Select, Spin, Upload } from 'antd';
import { CheckCircleFilled, StopOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { ChromePicker } from 'react-color';
import { AdvertiserID, ConquestID } from '@wormgraph/helpers';
import {
  AdvertiserStorageFolder,
  AffiliateStorageFolder,
  uploadImageToFirestore,
} from '@/api/firebase/storage';
import { $Vertical, $Horizontal } from '@/components/generics';

const getVideoDuration = (file: any): Promise<number> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // @ts-ignore
      const media = new Audio(reader.result);
      media.onloadedmetadata = () => resolve(media.duration);
    };
    reader.readAsDataURL(file);
    reader.onerror = (error) => reject(error);
  });

export const HiddenViewWidget = (data: any) => null;

interface AntUploadFileProps {
  advertiserID: AdvertiserID;
  conquestID?: ConquestID;
  newMediaDestination: React.MutableRefObject<string>;
  folderName: AdvertiserStorageFolder | AffiliateStorageFolder;
  acceptedFileTypes: 'image/*,video/mp4' | 'image/*' | 'video/mp4';
  forceRefresh?: () => void;
  notificationDuration?: number | null;
}
export const AntUploadFile: React.FC<AntUploadFileProps> = ({
  advertiserID,
  conquestID,
  newMediaDestination,
  folderName,
  acceptedFileTypes,
  forceRefresh,
  notificationDuration,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const customUploadImage = async ({ file, onSuccess }: any) => {
    console.log(file);
    if (file.type.indexOf('video') > -1) {
      if (file.size > 50000000) {
        if (notificationDuration || notificationDuration === null) {
          notification.open({
            message: 'Video Upload Error',
            description: 'Video must be under 50MB',
            // @ts-ignore
            btn: <Button onClick={() => notification.destroy('file-upload-error')}>Close</Button>,
            duration: notificationDuration,
            icon: <StopOutlined style={{ color: 'red' }} />,
            key: 'file-upload-error',
          });
        } else {
          message.error('Video must be under 50MB');
        }
        return;
      }

      const duration = await getVideoDuration(file);

      if (duration > 61) {
        if (notificationDuration || notificationDuration === null) {
          notification.open({
            message: 'Video upload error',
            description: 'Video must be under 60 seconds',
            // @ts-ignore
            btn: <Button onClick={() => notification.destroy('file-upload-error')}>Close</Button>,
            duration: notificationDuration,
            icon: <StopOutlined style={{ color: 'red' }} />,
            key: 'file-upload-error',
          });
        } else {
          message.error('Video must be under 60 seconds');
        }
        return;
      }
    }
    if (file.type.indexOf('image') > -1) {
      if (file.size > 10000000) {
        if (notificationDuration || notificationDuration === null) {
          notification.open({
            message: 'Image Upload Error',
            description: 'Image must be under 10MB',
            // @ts-ignore
            btn: <Button onClick={() => notification.destroy('file-upload-error')}>Close</Button>,
            duration: notificationDuration,
            icon: <StopOutlined style={{ color: 'red' }} />,
            key: 'file-upload-error',
          });
        } else {
          message.error('Image must be under 10MB');
        }
        return;
      }
    }
    const destination = await uploadImageToFirestore({
      folderName,
      file: file,
      folderID: conquestID,
      advertiserID,
    });
    newMediaDestination.current = destination;
    console.log(`>>> Uploaded to ${newMediaDestination.current}`);
    onSuccess('ok');
    if (notificationDuration || notificationDuration === null) {
      notification.open({
        message: 'Successful Upload',
        description: 'Your file has been uploaded',
        // @ts-ignore
        btn: <Button onClick={() => notification.destroy('file-upload-success')}>Close</Button>,
        duration: notificationDuration,
        icon: <CheckCircleFilled style={{ color: 'green' }} />,
        key: 'file-upload-success',
      });
    }
    if (forceRefresh) {
      forceRefresh();
    }
  };
  const handleChange: UploadProps['onChange'] = async (info: any) => {
    if (info.file.status === 'done') {
      if (!notificationDuration && notificationDuration !== null) {
        message.success(`${info.file.name} file uploaded successfully`);
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
    let newFileList = [...info.fileList];

    // 1. Limit the number of uploaded files
    // Only to show one recent uploaded files, and old ones will be replaced by the new
    newFileList = newFileList.slice(-1);

    // 2. Read from response and show file link
    newFileList = newFileList.map((file) => {
      if (file.response) {
        // Component will show file.url as link
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(newFileList);
  };
  const props = {
    onChange: handleChange,
    multiple: false,
    progress: {
      strokeColor: {
        '0%': '#108ee9',
        '100%': '#87d068',
      },
      strokeWidth: 3,
      format: (percent: any) => percent && `${parseFloat(percent.toFixed(2))}%`,
    },
  };
  return (
    <$Vertical>
      <Upload
        {...props}
        fileList={fileList}
        listType="text"
        style={{ overflow: 'hidden' }}
        accept={acceptedFileTypes}
        customRequest={customUploadImage}
      >
        <Button icon={<UploadOutlined />}>Upload</Button>
      </Upload>
    </$Vertical>
  );
};

export const DateView = ({ value }: { value: Moment }) => value.format('MMM Do YYYY');

export const PriceInput = ({ value, onChange }: { value: any; onChange: any }) =>
  value ? (
    <Row gutter={10}>
      <Col span={12}>
        <InputNumber
          style={{ width: '100%' }}
          value={value.price}
          min={0}
          onChange={(v) => onChange({ price: v, currency: value.currency })}
          formatter={(value) => `$ ${value}`}
        />
      </Col>
      <Col span={12}>
        <Select
          value={value.currency}
          onChange={(v) => onChange({ price: value.price, currency: v })}
        >
          <Select.Option value="USDC_Polygon">USDC Polygon</Select.Option>
        </Select>
      </Col>
    </Row>
  ) : null;

export const PriceView = ({ value }: { value: any }) => {
  return (
    <span>
      ${value.price} {value.currency}
    </span>
  );
};

export const AntColorPicker = ({ updateColor, initialColor }: any) => {
  const [color, setColor] = useState();
  useEffect(() => {
    setColor(initialColor);
  }, []);
  const handleChangeComplete = (data: any) => {
    setColor(data.hex);
    console.log(`chrome color picker data`, data.hex);
    updateColor(data.hex);
  };
  return <ChromePicker color={color} onChangeComplete={handleChangeComplete} />;
};
