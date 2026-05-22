const {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AWS_ACCESS_KEY_ID,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AWS_SECRET_ACCESS_KEY,
} = process.env;

const awsConfig = {
  region: 'us-west-2',
} as const;

const sesConfig = {
  // Verified SES sender identity for transactional emails (e.g. invitations).
  senderEmail: 'noreply@discovered-check.ca',
} as const;

export {
  awsConfig,
  sesConfig,
};
