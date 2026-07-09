import { Flex, Progress, Typography } from 'antd';
import { CheckCircleFilled, CloseCircleOutlined } from '@ant-design/icons';

import type { PasswordStrength } from '../features/auth/use-password-strength.ts';

const {
  Text,
} = Typography;

// zxcvbn score (0–4) → label + colour. Index directly by score.
const SCORE_META = [
  { label: 'Very weak',
    color: '#ff4d4f' },
  { label: 'Weak',
    color: '#ff7a45' },
  { label: 'Fair',
    color: '#faad14' },
  { label: 'Good',
    color: '#a0d911' },
  { label: 'Strong',
    color: '#52c41a' },
];

// The live composition checklist (each rule ticks green when satisfied) plus, once every rule passes,
// the zxcvbn strength bar. Purely presentational — state comes from usePasswordStrength.
export default function PasswordStrengthMeter({
  rules,
  score,
}: PasswordStrength) {
  const meta = score === null ? null : SCORE_META[score];

  return (
    <div style={{ marginTop: -8,
      marginBottom: 16 }}
    >
      <Flex vertical gap={2} style={{ marginBottom: meta ? 8 : 0 }}>
        {rules.map((rule) => (
          <Text
            key={rule.key}
            type={rule.met ? 'success' : 'secondary'}
            style={{ fontSize: 12 }}
          >
            {rule.met ? <CheckCircleFilled /> : <CloseCircleOutlined />}
            {' '}
            {rule.label}
          </Text>
        ))}
      </Flex>

      {meta && (
        <>
          <Progress
            percent={((score! + 1) / SCORE_META.length) * 100}
            steps={SCORE_META.length}
            showInfo={false}
            strokeColor={meta.color}
          />
          <Text style={{ fontSize: 12,
            color: meta.color }}
          >
            Strength:
            {' '}
            {meta.label}
          </Text>
        </>
      )}
    </div>
  );
}
