import { useAuth } from '@/api/firebase/useAuth';
import Footer from '@/components/Footer';
import client from '@/api/graphql/client';

import { LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import { browserLocalPersistence, browserSessionPersistence, setPersistence } from 'firebase/auth';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { ApolloProvider } from '@apollo/client';
import { FormattedMessage, history, SelectLang } from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import React, { ChangeEvent, useEffect, useState } from 'react';
import styles from './index.less';
import { auth } from '@/api/firebase/app';
import RegisterAccount from '@/components/RegisterAccount';
import ForgotPassword from '../ForgotPassword';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

type BullshitAntProAuthType = {
  username?: string;
  password?: string;
  captcha: string;
  mobile: string;
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<any>({});
  const [type, setType] = useState<string>('account');
  const persistence: 'session' | 'local' = (localStorage.getItem('auth.persistence') || 'local') as
    | 'local'
    | 'session';
  const [persistenceChecked, setPersistenceChecked] = useState(persistence === 'local');

  const { signInWithEmailAndPassword, sendPhoneVerification, signInPhoneWithCode } = useAuth();
  const [registrationModal, setRegistrationModal] = useState(false);
  const [hackyBugFixPhoneInput, setHackyBugFixPhoneInput] = useState<string>('');
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const handleVerificationRequest = async (phone: string) => {
    try {
      await sendPhoneVerification(`+1${phone}`);
      message.success('SMS verification sent to phone. May take up to 30 seconds to arrive');
    } catch (err: any) {
      message.error(err?.message);
    }
  };

  const handleSubmit = async (values: BullshitAntProAuthType) => {
    if (values.mobile && values.captcha) {
      try {
        await setPersistence(auth, browserLocalPersistence);
        const user = await signInPhoneWithCode(values.captcha);
        message.success('Phone login successful');
        const urlParams = new URL(window.location.href).searchParams;
        window.location.href = `${window.location.origin}/dashboard/getting-started`;
        return;
      } catch (err: any) {
        message.error(err?.message || 'Phone Login has failed');
      }
    } else if (values.username && values.password) {
      try {
        await setPersistence(auth, browserLocalPersistence);
        await signInWithEmailAndPassword(values.username, values.password);
        message.success('Email login successful');
        window.location.href = `${window.location.origin}/dashboard/getting-started`;
      } catch (err: any) {
        message.error(err?.message || 'Email Login has failed');
      }
    } else {
      message.error('Please fill in login details');
    }
  };

  const clickRememberMe = (e: ChangeEvent<HTMLInputElement>) => {
    const newPersistenceChecked = e.target.checked;
    setPersistenceChecked(newPersistenceChecked);
    if (newPersistenceChecked) {
      setPersistence(auth, browserLocalPersistence);
      localStorage.setItem('auth.persistence', 'local');
      return;
    } else {
      setPersistence(auth, browserSessionPersistence);
      localStorage.setItem('auth.persistence', 'session');
      return;
    }
  };

  const { status, type: loginType } = userLoginState;

  return (
    <div>
      <div className={styles.content}>
        <LoginForm
          // @ts-ignore
          title={
            <h1 style={{ fontWeight: 900, color: '#26A6EF', fontSize: '2rem' }}>🎁 LOOTBOX</h1>
          }
          subTitle={'Advertiser Dashboard'}
          initialValues={{
            autoLogin: true,
          }}
          onChange={(e: any) => {
            if (e.target.id === 'mobile') {
              setHackyBugFixPhoneInput(e.target.value);
            }
          }}
          onFinish={async (values: BullshitAntProAuthType) => {
            await handleSubmit(values);
          }}
        >
          {status === 'error' && loginType === 'account' && (
            <LoginMessage content={'Email or password was incorrect'} />
          )}

          <>
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} />,
              }}
              placeholder={'Email'}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.username.required"
                      defaultMessage="Email is required"
                    />
                  ),
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon} />,
              }}
              placeholder={'Password'}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.password.required"
                      defaultMessage="Password is required"
                    />
                  ),
                },
              ]}
            />
          </>

          {status === 'error' && loginType === 'mobile' && <LoginMessage content="验证码错误" />}

          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage id="pages.login.rememberMe" defaultMessage="Remember Me" />
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
              href="https://lootbox.fund/profile"
            >
              <FormattedMessage id="pages.login.forgotPassword" defaultMessage="Forgot Password" />
            </a>
          </div>
          <a onClick={() => setRegistrationModal(true)} style={{ marginBottom: '10px' }}>
            Register
          </a>
        </LoginForm>
      </div>

      <div id="recaptcha-container" />
      <RegisterAccount isModalOpen={registrationModal} setIsModalOpen={setRegistrationModal} />
      <ForgotPassword isModalOpen={forgotPasswordModal} setIsModalOpen={setForgotPasswordModal} />
    </div>
  );
};

export default Login;
