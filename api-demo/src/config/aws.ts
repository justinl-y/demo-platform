const {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AWS_ACCESS_KEY_ID,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AWS_SECRET_ACCESS_KEY,
} = process.env;

const awsConfig = {
  region: 'us-west-2',
} as const;

export {
  awsConfig,
};
