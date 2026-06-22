import postLogin from './post-login/schema.ts';
import postRefresh from './post-refresh/schema.ts';
import postLogout from './post-logout/schema.ts';
import postPasswordForgot from './post-password-forgot/schema.ts';
import postPasswordReset from './post-password-reset/schema.ts';

const schema = {
  postLogin,
  postRefresh,
  postLogout,
  postPasswordForgot,
  postPasswordReset,
};

export default schema;
