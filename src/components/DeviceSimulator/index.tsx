import { CreativeType } from '@/api/graphql/generated/types';
import { AspectRatio, Placement } from '@wormgraph/helpers';
import { Button } from 'antd';
import React, { ReactElement, ReactHTMLElement, useRef } from 'react';
import styles from './index.less';
import { $Vertical, placeholderImage, $Horizontal, placeholderVideo } from '@/components/generics';

const aspectRatioCSS = {
  [AspectRatio.Landscape16x9]: '16 / 9',
  [AspectRatio.Portrait2x3]: '2 / 3',
  [AspectRatio.Portrait9x16]: '9 / 16',
  [AspectRatio.Square1x1]: '1 / 1',
  [AspectRatio.Tablet4x5]: '4 / 5',
};
interface DeviceSimulatorProps {
  placement?: Placement;
  creative?: {
    themeColor?: string;
    callToAction?: string;
    creativeType: CreativeType;
    creativeLinks?: string[];
    aspectRatio?: AspectRatio;
  };
}
const defaults = {
  themeColor: '#000000',
  callToAction: 'Learn More',
  creativeType: CreativeType.Image,
  creativeLinks: [placeholderImage],
  aspectRatio: AspectRatio.Portrait9x16,
};
const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({ placement, creative }) => {
  const mainVideo = useRef<HTMLVideoElement>(null);
  const blurVideo = useRef<HTMLVideoElement>(null);
  const renderImagePreview = () => {
    const imageToShow = (creative?.creativeLinks || []).filter((c) => c.indexOf('.mp4') === -1)[0]
      ? (creative?.creativeLinks || []).filter((c) => c.indexOf('.mp4') === -1)[0]
      : defaults.creativeLinks[0];
    return (
      <$Vertical
        justifyContent={creative?.aspectRatio === AspectRatio.Portrait9x16 ? 'flex-end' : 'center'}
        style={{
          width: '100%',
          border: 'none',
          height: '100%',
          position: 'relative',
        }}
      >
        <$Vertical
          justifyContent="center"
          style={{ width: '100%', height: '100%', position: 'relative', zIndex: 2 }}
        >
          <img
            src={imageToShow}
            style={
              creative &&
              creative.aspectRatio && {
                width: '100%',
                objectFit: 'cover',
                objectPosition: 'top center',
                aspectRatio: aspectRatioCSS[creative.aspectRatio] || '1 / 1',
              }
            }
          />
          <$Horizontal
            justifyContent="center"
            style={{ width: '100%', padding: '20px 0px', backgroundColor: 'rgba(0,0,0,0.3)' }}
          >
            <button
              style={{
                width: '90%',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                padding: '15px',
                border: 'none',
                borderRadius: '5px',
                backgroundColor: creative?.themeColor || defaults.themeColor,
                color: '#ffffff',
              }}
            >
              {creative?.callToAction || defaults.callToAction}
            </button>
          </$Horizontal>
        </$Vertical>
        <div
          style={{
            width: '100%',
            border: 'none',
            height: '100%',
            backgroundImage: `url("${imageToShow}")`,
            objectFit: 'cover',
            filter: 'blur(8px)',
            WebkitFilter: 'blur(8px)',
            position: 'absolute',
            zIndex: 1,
          }}
        />
      </$Vertical>
    );
  };
  const renderVideoPreview = () => {
    const videoToShow =
      creative?.creativeLinks && creative.creativeLinks.filter((c) => c.indexOf('.mp4') > -1)[0]
        ? creative.creativeLinks.filter((c) => c.indexOf('.mp4') > -1)[0]
        : placeholderVideo;
    return (
      <$Vertical
        justifyContent={creative?.aspectRatio === AspectRatio.Portrait9x16 ? 'flex-end' : 'center'}
        style={{
          width: '100%',
          border: 'none',
          height: '100%',
          position: 'relative',
        }}
      >
        <$Vertical
          justifyContent="center"
          style={{ width: '100%', height: '100%', position: 'relative', zIndex: 2 }}
        >
          <video
            ref={mainVideo}
            autoPlay
            loop
            muted
            controls
            onPause={() => blurVideo.current?.pause()}
            onPlay={() => blurVideo.current?.play()}
            onTimeUpdate={() =>
              blurVideo.current &&
              mainVideo.current &&
              (blurVideo.current.currentTime = mainVideo.current.currentTime)
            }
            src={videoToShow}
            style={
              creative &&
              creative.aspectRatio && {
                width: '100%',
                objectFit: 'cover',
                objectPosition: 'top center',
                aspectRatio: aspectRatioCSS[creative.aspectRatio] || '1 / 1',
              }
            }
          >
            <source src={videoToShow} type="video/mp4" />
            <source src={videoToShow} type="video/ogg" />
          </video>
          <$Horizontal
            justifyContent="center"
            style={{ width: '100%', padding: '20px 0px', backgroundColor: 'rgba(0,0,0,0.3)' }}
          >
            <button
              style={{
                width: '90%',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                padding: '15px',
                border: 'none',
                borderRadius: '5px',
                backgroundColor: creative?.themeColor || defaults.themeColor,
                color: '#ffffff',
              }}
            >
              {creative?.callToAction || defaults.callToAction}
            </button>
          </$Horizontal>
        </$Vertical>
        <video
          ref={blurVideo}
          src={videoToShow}
          autoPlay
          loop
          muted
          style={{
            width: '100%',
            border: 'none',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(8px)',
            WebkitFilter: 'blur(8px)',
            position: 'absolute',
            zIndex: 1,
          }}
        >
          <source src={videoToShow} type="video/mp4" />
          <source src={videoToShow} type="video/ogg" />
        </video>
      </$Vertical>
    );
  };
  const renderPlacementDemo = (placement: Placement) => {
    if (placement === Placement.AfterTicketClaim) {
      return (
        <iframe
          src="https://go.lootbox.fund/r?r=0178JimEB6"
          style={{ width: '100%', border: 'none', height: '100%' }}
        />
      );
    }
  };
  const renderSimulation = () => {
    if (placement) {
      return renderPlacementDemo(placement);
    }
    if (creative && creative.creativeType === CreativeType.Image) {
      return renderImagePreview();
    }
    if (creative && creative.creativeType === CreativeType.Video) {
      return renderVideoPreview();
    }
    return (
      <iframe
        src="https://go.lootbox.fund/r?r=0178JimEB6"
        style={{ width: '100%', border: 'none', height: '100%' }}
      />
    );
  };
  return (
    <div className={styles.smartphone}>
      <div className={styles.viewPort}>{renderSimulation()}</div>
    </div>
  );
};

export default DeviceSimulator;
