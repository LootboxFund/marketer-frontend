import { useAuth } from '@/api/firebase/useAuth';
import Footer from '@/components/Footer';
import client from '@/api/graphql/client';

import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import { browserLocalPersistence, onAuthStateChanged, setPersistence } from 'firebase/auth';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { ApolloProvider } from '@apollo/client';
import { FormattedMessage, history, SelectLang, useIntl, useModel } from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import React, { useState } from 'react';
import styles from './index.less';
import { auth } from '@/api/firebase/app';

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
  const { initialState, setInitialState } = useModel('@@initialState');

  const { sendPhoneVerification, signInPhoneWithCode } = useAuth();

  const [hackyBugFixPhoneInput, setHackyBugFixPhoneInput] = useState<string>('');

  const fetchUserInfo = async () => {
    const userInfo = await (initialState as any)?.fetchUserInfo?.();
    if (userInfo) {
      await setInitialState((s: any) => ({
        ...s,
        currentUser: userInfo,
      }));
    }
  };

  const handleVerificationRequest = async (phone: string) => {
    try {
      await sendPhoneVerification(`+1${phone}`);
    } catch (err: any) {
      message.error(err?.message);
    } finally {
      message.success('SMS verification sent to phone. May take up to 30 seconds to arrive');
    }
  };

  const handleSubmit = async (values: BullshitAntProAuthType) => {
    console.log(values);
    if (values.mobile && values.captcha) {
      try {
        setPersistence(auth, browserLocalPersistence);
        const user = await signInPhoneWithCode(values.captcha);
        if (user.__typename === 'CreateUserResponseSuccess') {
          await fetchUserInfo();
        }
      } catch (err: any) {
        message.error(err?.message || 'Phone Login has failed');
      } finally {
        message.success('Phone login successful');
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      }
    } else if (values.username && values.password) {
    } else {
      message.error('Please fill in login details');
    }
    // try {
    // if (msg.status === 'ok') {
    //   const defaultLoginSuccessMessage = intl.formatMessage({
    //     id: 'pages.login.success',
    //     defaultMessage: '登录成功！',
    //   });
    //   message.success(defaultLoginSuccessMessage);
    //   await fetchUserInfo();
    //   const urlParams = new URL(window.location.href).searchParams;
    //   history.push(urlParams.get('redirect') || '/');
    //   return;
    // }
    // console.log(msg);
    // 如果失败去设置用户错误信息
    // setUserLoginState(msg);
    // } catch (error: any) {
    //   console.log(error);
    //   message.error(error.message || 'Login has failed');
    // }
  };
  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <div className={styles.lang} data-lang>
        {SelectLang && <SelectLang />}
      </div>
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
            console.log(e);
            if (e.target.id === 'mobile') {
              setHackyBugFixPhoneInput(e.target.value);
            }
          }}
          actions={[
            <FormattedMessage
              key="loginWith"
              id="pages.login.loginWith"
              defaultMessage="其他登录方式"
            />,
            <AlipayCircleOutlined key="AlipayCircleOutlined" className={styles.icon} />,
            <TaobaoCircleOutlined key="TaobaoCircleOutlined" className={styles.icon} />,
            <WeiboCircleOutlined key="WeiboCircleOutlined" className={styles.icon} />,
          ]}
          onFinish={async (values: BullshitAntProAuthType) => {
            await handleSubmit(values);
          }}
        >
          <Tabs activeKey={type} onChange={setType} centered>
            <Tabs.TabPane key="account" tab={'Email Login'} />
            <Tabs.TabPane key="mobile" tab={'Phone Login'} />
          </Tabs>

          {status === 'error' && loginType === 'account' && (
            <LoginMessage content={'Email or password was incorrect'} />
          )}
          {type === 'account' && (
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
          )}

          {status === 'error' && loginType === 'mobile' && <LoginMessage content="验证码错误" />}
          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined className={styles.prefixIcon} />,
                }}
                name="mobile"
                placeholder={'Phone Number'}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.required"
                        defaultMessage="请输入手机号！"
                      />
                    ),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.invalid"
                        defaultMessage="手机号格式错误！"
                      />
                    ),
                  },
                ]}
              />
              <div id="recaptcha-container" />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={'SMS Code'}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${'sec'}`;
                  }
                  return 'Get Code';
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.captcha.required"
                        defaultMessage="Enter verification code"
                      />
                    ),
                  },
                ]}
                onGetCaptcha={async (phone) => {
                  console.log(`phone = ${hackyBugFixPhoneInput}`);
                  await handleVerificationRequest(hackyBugFixPhoneInput);
                }}
              />
            </>
          )}
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
            >
              <FormattedMessage id="pages.login.forgotPassword" defaultMessage="Forgot Password" />
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

const WrappedLogin: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <Login />
    </ApolloProvider>
  );
};

export default WrappedLogin;
