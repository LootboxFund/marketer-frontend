import { useAuth } from '@/api/firebase/useAuth';
import { Button, Input, message, Modal } from 'antd';
import { useState } from 'react';

export type RegisterAccountProps = {
  isModalOpen: boolean;
  setIsModalOpen: (bool: boolean) => void;
};

const RegisterAccount: React.FC<RegisterAccountProps> = ({ isModalOpen, setIsModalOpen }) => {
  const { signUpWithEmailAndPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUpWithEmailAndPassword = async () => {
    setLoading(true);
    try {
      await signUpWithEmailAndPassword(email, password, password);
      // message.success(
      //   'Registered account! You must now request to be upgraded to an advertiser or affiliate.',
      // );
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      title="Register for Lootbox"
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={false}
    >
      <label>Email</label>
      <Input
        value={email}
        type="email"
        size="large"
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: '5px' }}
      />

      <label>Password</label>
      <Input
        value={password}
        size="large"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: '10px' }}
      />

      <Button
        onClick={() => handleSignUpWithEmailAndPassword()}
        loading={loading}
        type="primary"
        size="large"
      >
        Register
      </Button>
    </Modal>
  );
};

export default RegisterAccount;
