SimpleARLocalizer::transform( User, :en, {
  name: 'User',

  attributes: {
    email: 'Email',
    password: 'Password',
    remember_me: 'Remember me'
  },

  prompts: {
    forgot_my_password: 'Forgot your password?',
    remembered_password: 'Remembered it!',
    reset_password: 'I confirm my muppetry',
    log_in: 'Let me in!'
  },

  titles: {
    log_in: 'Log in',
    reset_password: 'Forgot your password?'
  },

  breadcrumbs: {
    log_in: 'Log in',
    reset_password: 'I’m a muppet'
  }
})
