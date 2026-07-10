import { Alert, Button, Card, Flex, Form, Input, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from '@tanstack/react-router';

import { useLogin } from '../features/auth/use-login.ts';
import { APP_DISPLAY_NAME, BUILD_LABEL, ENV_LABEL } from '../lib/env.ts';

import type { Login } from '#shared/types';

const {
  Title, Text,
} = Typography;

export default function LoginPage() {
  const login = useLogin();

  return (
    <Flex
      align='center'
      justify='center'
      style={{ minHeight: '100vh',
        padding: 16,
        position: 'relative' }}
    >
      <Card style={{ width: 380 }}>
        <Title
          level={3}
          style={{ textAlign: 'center',
            marginBottom: 24 }}
        >
          {APP_DISPLAY_NAME}
          {ENV_LABEL && (
            <span style={{ display: 'block',
              fontSize: 14,
              fontWeight: 400,
              opacity: 0.65 }}
            >
              (
              {ENV_LABEL}
              )
            </span>
          )}
        </Title>

        {login.isError && (
          <Alert
            type='error'
            showIcon
            title='Login failed'
            description='Check your email and password and try again.'
            style={{ marginBottom: 16 }}
          />
        )}

        <Form<Login>
          layout='vertical'
          requiredMark={false}
          disabled={login.isPending}
          onFinish={(values) => login.mutate(values)}
        >
          <Form.Item
            label='Email'
            name='email'
            rules={[
              { required: true,
                message: 'Email is required' },
              { type: 'email',
                message: 'Enter a valid email' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder='you@example.com' autoComplete='username' size='large' />
          </Form.Item>

          <Form.Item
            label='Password'
            name='password'
            rules={[{ required: true,
              message: 'Password is required' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder='Password' autoComplete='current-password' size='large' />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type='primary' htmlType='submit' block size='large' loading={login.isPending}>
              Sign in
            </Button>
          </Form.Item>
        </Form>

        <Flex justify='center' style={{ marginTop: 16 }}>
          <Link to='/password-forgot'>Forgot password?</Link>
        </Flex>
      </Card>

      {/* Commit id on deployed builds (stage/prod); the environment name on the local/test dev servers. */}
      {BUILD_LABEL && (
        <Text
          type='secondary'
          style={{ position: 'absolute',
            right: 16,
            bottom: 12,
            fontSize: 12 }}
        >
          {`Build: ${BUILD_LABEL}`}
        </Text>
      )}
    </Flex>
  );
}
