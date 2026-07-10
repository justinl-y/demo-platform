import { Alert, Button, Card, Flex, Form, Input, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { Link, getRouteApi } from '@tanstack/react-router';

import PasswordStrengthMeter from '../components/PasswordStrengthMeter.tsx';
import { usePasswordReset } from '../features/auth/use-password-reset.ts';
import { usePasswordStrength } from '../features/auth/use-password-strength.ts';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_SCORE, allRulesMet, scorePassword } from '../lib/password-policy.ts';

const {
  Title,
} = Typography;

// The reset token arrives as ?token= on the emailed link. getRouteApi (by path, not by importing the
// route) reads the validated search params without a page↔route import cycle.
const routeApi = getRouteApi('/password-reset');

interface FormValues {
  new_password: string;
  confirm_password: string;
}

export default function PasswordResetPage() {
  const {
    token,
  } = routeApi.useSearch();
  const passwordReset = usePasswordReset();

  // Track the password field so the live checklist + strength meter can react to it. Hooks run
  // unconditionally (before the no-token early return) to keep hook order stable; useWatch returns
  // undefined until the field mounts.
  const [form] = Form.useForm<FormValues>();
  const newPassword = Form.useWatch('new_password', form) ?? '';
  const strength = usePasswordStrength(newPassword);

  // A link with no token can never succeed — don't render the form, point the user back to the
  // request page instead of letting them submit into a guaranteed 400.
  if (!token) {
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

          <Alert
            type='error'
            showIcon
            title='Invalid reset link'
            description='This password reset link is missing or malformed. Request a new one to continue.'
          />

          <Flex justify='center' style={{ marginTop: 16 }}>
            <Link to='/password-forgot'>Request a new link</Link>
          </Flex>
        </Card>
      </Flex>
    );
  }

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
          Choose a new password
        </Title>

        {passwordReset.isError && (
          <Alert
            type='error'
            showIcon
            title='Reset failed'
            description='This reset link is invalid or has expired. Request a new one and try again.'
            style={{ marginBottom: 16 }}
          />
        )}

        <Form<FormValues>
          form={form}
          layout='vertical'
          requiredMark={false}
          disabled={passwordReset.isPending}
          onFinish={({
            new_password: submittedPassword,
          }) => passwordReset.mutate({ password_reset_token: token,
            new_password: submittedPassword })}
        >
          <Form.Item
            label='New password'
            name='new_password'
            // Validate on blur/submit, not per keystroke: the async validator scores with zxcvbn, and
            // the live checklist + meter below already give real-time feedback. onChange would run the
            // scorer on every keystroke and flash errors mid-typing.
            validateTrigger='onBlur'
            rules={[
              { required: true,
                message: 'Password is required' },
              { max: PASSWORD_MAX_LENGTH,
                message: `Password must be at most ${PASSWORD_MAX_LENGTH} characters` },
              // Mirrors the API's two gates: composition rules (shown live below), then a minimum
              // zxcvbn score. Async because scoring lazy-loads the analysis chunk.
              {
                validator: async (_rule, value: string) => {
                  if (!value) return;
                  if (!allRulesMet(value)) throw new Error('Password does not meet all the requirements below');
                  // Best-effort client gate: if scoring is unavailable (chunk failed to load) fall back
                  // to passing and let the server enforce the score, rather than blocking a valid reset.
                  const score = await scorePassword(value).catch(() => PASSWORD_MIN_SCORE);
                  if (score < PASSWORD_MIN_SCORE) throw new Error('Password is too easy to guess — make it less predictable');
                },
              },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder='New password' autoComplete='new-password' size='large' />
          </Form.Item>

          <PasswordStrengthMeter {...strength} />

          <Form.Item
            label='Confirm password'
            name='confirm_password'
            dependencies={['new_password']}
            rules={[
              { required: true,
                message: 'Please confirm your password' },
              ({
                getFieldValue,
              }) => ({
                validator: (_rule, value) =>
                  !value || getFieldValue('new_password') === value
                    ? Promise.resolve()
                    : Promise.reject(new Error('Passwords do not match')),
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder='Confirm password' autoComplete='new-password' size='large' />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type='primary' htmlType='submit' block size='large' loading={passwordReset.isPending}>
              Reset password
            </Button>
          </Form.Item>
        </Form>

        <Flex justify='center' style={{ marginTop: 16 }}>
          <Link to='/login'>Back to sign in</Link>
        </Flex>
      </Card>
    </Flex>
  );
}
