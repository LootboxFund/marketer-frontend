import Footer from '@/components/Footer';
import LoginAccount from '@/components/LoginAccount';
import React from 'react';
import styles from './index.less';
import { $Vertical } from '@/components/generics';

const Login: React.FC = () => {
  return (
    <div className={styles.container}>
      <div
        style={{
          flex: 1,
          backgroundImage: `url("https://s.tmimgcdn.com/scr/1200x750/139800/cartoon-lowpoly-earth-planet-2-uvw-3d-model_139829-original.jpg")`,
          backgroundPosition: 'center top',
          backgroundSize: 'cover',
        }}
      />
      <$Vertical style={{ flex: 1 }}>
        <div
          style={{
            margin: 'auto',
            height: '100%',
            paddingTop: '15%',
          }}
        >
          <LoginAccount />
        </div>
        <Footer />
      </$Vertical>
    </div>
  );
};

export default Login;
