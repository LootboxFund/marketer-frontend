import type {
  CreateUserResponse,
  MutationCreateUserWithPasswordArgs,
  ResponseError,
  UpgradeToAdvertiserResponse,
  UpgradeToAffiliateResponse,
} from '../../graphql/generated/types';
import { useEffect, useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { auth } from '../app';
import {
  SIGN_UP_WITH_PASSWORD,
  CREATE_USER,
  UPGRADE_TO_ADVERTISER,
  UPGRADE_TO_AFFILIATE,
} from './api.gql';
import {
  signInWithEmailAndPassword as signInWithEmailAndPasswordFirebase,
  sendEmailVerification,
  browserSessionPersistence,
  browserLocalPersistence,
  setPersistence,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  User,
  updateEmail,
} from 'firebase/auth';
import client from '../../graphql/client';
import { throwInvalidPasswords } from './password';
import type { UserID } from '@wormgraph/helpers';
import { ADVERTISER_ID_COOKIE } from '@/api/constants';
import { useCookies } from 'react-cookie';
import { GET_ADVERTISER } from '@/components/LoginAccount/api.gql';
import { message } from 'antd';

interface FrontendUser {
  id: UserID;
  email: string | null;
  phone: string | null;
  isEmailVerified: boolean;
  username: string | null;
  avatar: string | null;
}

const EMAIL_VERIFICATION_COOKIE_NAME = 'email.verification.sent';

const convertUserToUserFE = (user: User): FrontendUser => {
  const { uid, email, phoneNumber, displayName, photoURL, emailVerified } = user;
  const userData: FrontendUser = {
    id: uid as UserID,
    email: email,
    phone: phoneNumber,
    isEmailVerified: emailVerified,
    username: displayName,
    avatar: photoURL,
  };
  return userData;
};

export const useAuth = () => {
  /**
   * user = undefined -> unset (loading)
   * user = null -> unauthenticated
   * user = USER -> authenticated
   */
  const [user, setUser] = useState<FrontendUser | undefined | null>(undefined);

  const [cookies, setCookie, removeCookie] = useCookies([ADVERTISER_ID_COOKIE]);

  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [phoneConfirmationResult, setPhoneConfirmationResult] = useState<ConfirmationResult | null>(
    null,
  );

  const [upgradeToAffiliateMutation] =
    useMutation<{ upgradeToAffiliate: UpgradeToAffiliateResponse }>(UPGRADE_TO_AFFILIATE);

  const [
    getAdvertiser,
    { loading: loadingAdvertiser, error: errorAdvertiser, data: dataAdvertiser },
  ] = useLazyQuery(GET_ADVERTISER);

  useEffect(() => {
    if (!loadingAdvertiser && !errorAdvertiser && dataAdvertiser) {
      setCookie(ADVERTISER_ID_COOKIE, dataAdvertiser.id, { path: '/' });
    }
  }, [dataAdvertiser]);

  const setCaptcha = () => {
    const el = document.getElementById('recaptcha-container');
    if (!!el) {
      const recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container',
        {
          size: 'invisible',
        },
        auth,
      );
      setRecaptchaVerifier(recaptchaVerifier);
    }
  };
  useEffect(() => {
    setCaptcha();
  }, []);

  const [signUpWithPasswordMutation] = useMutation<
    { createUserWithPassword: CreateUserResponse },
    MutationCreateUserWithPasswordArgs
  >(SIGN_UP_WITH_PASSWORD);

  const [upgradeToAdvertiserMutation] =
    useMutation<{ upgradeToAdvertiser: UpgradeToAdvertiserResponse }>(UPGRADE_TO_ADVERTISER);

  const [createUserMutation] = useMutation<{ createUserRecord: CreateUserResponse }>(CREATE_USER);

  const setAuthPersistence = () => {
    const persistence: 'session' | 'local' = (localStorage.getItem('auth.persistence') ||
      'local') as 'local' | 'session';

    if (persistence === 'local') {
      setPersistence(auth, browserLocalPersistence);
    } else {
      setPersistence(auth, browserSessionPersistence);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userData = convertUserToUserFE(user);
        setUser(userData);
      } else {
        setUser(null);
      }
      client.resetStore();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const sendPhoneVerification = async (phoneNumber: string) => {
    setCaptcha();
    if (!phoneNumber) {
      throw new Error('Please enter your phone number');
    }

    if (phoneNumber[0] !== '+') {
      throw new Error("Please include a country code +1, +44, etc. Don't forget the +");
    }

    const el = document.getElementById('recaptcha-container');
    if (!recaptchaVerifier) {
      console.error('no captcha verifier');
      throw new Error('no captcha verifier');
    } else {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setPhoneConfirmationResult(confirmationResult);
    }
  };

  const signInPhoneWithCode = async (code: string, email?: string) => {
    if (!phoneConfirmationResult) {
      console.error('No phone confirmation result');
      throw new Error('No phone confirmation result');
    }

    const result = await phoneConfirmationResult.confirm(code);

    const { user } = result;

    // Update their email only if the user does not have an email listed
    if (!user.email && !!email) {
      try {
        await updateEmail(user, email);
      } catch (err) {
        console.error('Error updating email');
      }
    }

    // Now create a user record
    const { data } = await createUserMutation();

    if (!data || data.createUserRecord?.__typename === 'ResponseError') {
      console.error(
        'Error creating user record',
        (data?.createUserRecord as ResponseError)?.error?.message,
      );
      throw new Error('Error creating user record');
    }

    // Send email verification only once on login
    const verificationEmailAlreadySent = localStorage.getItem(EMAIL_VERIFICATION_COOKIE_NAME);

    if (!!user.email && !user.emailVerified && !verificationEmailAlreadySent) {
      sendEmailVerification(user)
        .then(() => {
          localStorage.setItem(EMAIL_VERIFICATION_COOKIE_NAME, 'true');
        })
        .catch((err) => console.log(err));
    }

    await getAdvertiser();

    return data.createUserRecord as CreateUserResponse;
  };

  const signInWithEmailAndPassword = async (email: string, password: string): Promise<void> => {
    if (!email) {
      throw new Error('Email is required');
    }

    if (!password) {
      throw new Error('Password is required');
    }

    setAuthPersistence();

    const { user } = await signInWithEmailAndPasswordFirebase(auth, email, password);

    // Send email verification only once on login
    const verificationEmailAlreadySent = localStorage.getItem(EMAIL_VERIFICATION_COOKIE_NAME);

    await getAdvertiser();

    if (!!user.email && !user.emailVerified && !verificationEmailAlreadySent) {
      sendEmailVerification(user)
        .then(() => {
          localStorage.setItem(EMAIL_VERIFICATION_COOKIE_NAME, 'true');
        })
        .catch((err) => console.log(err));
    }
  };

  const signUpWithEmailAndPassword = async (
    email: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<string> => {
    if (!email) {
      throw new Error('Email is required');
    }

    // This will throw if the passwords are not valid
    throwInvalidPasswords({ password, passwordConfirmation });

    const { data } = await signUpWithPasswordMutation({
      variables: {
        payload: {
          email,
          password,
        },
      },
    });

    if (!data) {
      throw new Error('An error occurred');
    } else if (data?.createUserWithPassword?.__typename === 'ResponseError') {
      throw new Error(data.createUserWithPassword.error.message);
    }
    if (data.createUserWithPassword.__typename === 'CreateUserResponseSuccess') {
      return data.createUserWithPassword.user.id;
    }
    return '';
  };

  const upgradeToAdvertiser = async () => {
    const { data } = await upgradeToAdvertiserMutation();

    if (!data) {
      throw new Error('An error occurred');
    } else if (data?.upgradeToAdvertiser?.__typename === 'ResponseError') {
      throw new Error(data.upgradeToAdvertiser.error.message);
    } else if (data?.upgradeToAdvertiser?.__typename === 'UpgradeToAdvertiserResponseSuccess') {
      message.success('Successfully registered as an advertiser!');
      setCookie(ADVERTISER_ID_COOKIE, data.upgradeToAdvertiser.advertiser.id, { path: '/' });
    }
    return data.upgradeToAdvertiser;
  };

  const logout = async (): Promise<void> => {
    await auth.signOut();
    setUser(null);
    removeCookie(ADVERTISER_ID_COOKIE, { path: '/' });
  };

  const upgradeToAffiliate = async () => {
    const { data } = await upgradeToAffiliateMutation();

    if (!data) {
      throw new Error('An error occurred');
    } else if (data?.upgradeToAffiliate?.__typename === 'ResponseError') {
      throw new Error(data.upgradeToAffiliate.error.message);
    } else if (data?.upgradeToAffiliate?.__typename === 'UpgradeToAffiliateResponseSuccess') {
      message.success('Successfully registered as an affiliate!');
    }
    return data.upgradeToAffiliate;
  };

  // const updatePassword = async (password: string, newPassword: string): Promise<void> => {

  return {
    user,
    signInWithEmailAndPassword,
    signUpWithEmailAndPassword,
    upgradeToAdvertiser,
    upgradeToAffiliate,
    sendPhoneVerification,
    signInPhoneWithCode,
    logout,
  };
};
