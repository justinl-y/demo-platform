import { Alert, Button, Card, Flex, Form, Input, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link } from '@tanstack/react-router';

import { usePasswordForgot } from '../features/auth/use-password-forgot.ts';

import type { PasswordForgot } from '#shared/types';

const {
  Title, Paragraph,
} = Typography;

export default function PasswordForgotPage() {
  const passwordForgot = usePasswordForgot();

  return (
    <Flex
      align='center'
      justify='center'
      style={{ minHeight: '100vh',
        padding: 16 }}
    >
      <Card style={{ width: 380 }}>
        <Title
          level={3}
          style={{ textAlign: 'center',
            marginBottom: 24 }}
        >
          Reset your password
        </Title>

        {passwordForgot.isSuccess && (
          // Deliberately generic: never confirm whether the address maps to an account (the API is
          // enumeration-resistant, and the UI must not undo that).
          <Alert
            type='success'
            showIcon
            title='Check your email'
            description='If an account exists for that address, we’ve sent a link to reset your password.'
          />
        )}

        {!passwordForgot.isSuccess && (
          <>
            <Paragraph type='secondary' style={{ marginBottom: 24 }}>
              Enter your account email and we’ll send you a link to reset your password.
            </Paragraph>

            {passwordForgot.isError && (
              <Alert
                type='error'
                showIcon
                title='Something went wrong'
                description='We couldn’t send the reset email. Please try again.'
                style={{ marginBottom: 16 }}
              />
            )}

            <Form<PasswordForgot>
              layout='vertical'
              requiredMark={false}
              disabled={passwordForgot.isPending}
              onFinish={(values) => passwordForgot.mutate(values)}
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

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type='primary' htmlType='submit' block size='large' loading={passwordForgot.isPending}>
                  Send reset link
                </Button>
              </Form.Item>
            </Form>
          </>
        )}

        <Flex justify='center' style={{ marginTop: 16 }}>
          <Link to='/login'>Back to sign in</Link>
        </Flex>
      </Card>
    </Flex>
  );
}
