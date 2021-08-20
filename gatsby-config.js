module.exports = {
  flags: {
    DEV_SSR: true,
  },
  siteMetadata: {
    siteUrl: `https://www.yourdomain.tld`,
    title: `drupal-gatsby-integration-test`,
  },
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://dev-gatsby-drupal-stress-testing.pantheonsite.io/`,
        fastBuilds: true,
        basicAuth: {
          username: `admin`,
          password: `password`,
        },
      },
    },
  ],
}
