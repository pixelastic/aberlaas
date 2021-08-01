module.exports = {
  // docSearch: {
  //   apiKey: 'XXXXXX',
  //   indexName: 'pixelastic_XXXXXX',
  // },
  navigation: [
    {
      name: 'Overview',
      links: [
        {
          title: 'Getting Started',
          href: '/',
        },
        {
          title: 'Configuration',
          href: 'configuration',
        },
      ],
    },
    {
      name: 'Init',
      links: [
        {
          title: 'Overview',
          href: 'init/',
        },
      ],
    },
    {
      name: 'Setup',
      links: [
        {
          title: 'Overview',
          href: 'setup/',
        },
        {
          title: 'GitHub',
          href: 'setup/github',
        },
        {
          title: 'CircleCI',
          href: 'setup/circleci',
        },
        {
          title: 'Renovate',
          href: 'setup/renovate',
        },
      ],
    },
    {
      name: 'Lint',
      links: [
        {
          title: 'Overview',
          href: 'lint/',
        },
        {
          title: 'Configuration',
          href: 'test/configuration',
        },
        {
          title: 'CSS',
          href: 'lint/css',
        },
        {
          title: 'JavaScript',
          href: 'lint/js',
        },
        {
          title: 'JSON',
          href: 'lint/json',
        },
        {
          title: 'YAML',
          href: 'lint/yaml',
        },
        {
          title: 'CircleCI',
          href: 'lint/circleci',
        },
      ],
    },
    {
      name: 'Test',
      links: [
        {
          title: 'Overview',
          href: 'test/',
        },
        {
          title: 'Configuration',
          href: 'test/configuration',
        },
        {
          title: 'Jest',
          href: 'test/jest',
        },
      ],
    },
    {
      name: 'Release',
      links: [
        {
          title: 'Overview',
          href: 'release/',
        },
        {
          title: 'Auto-release',
          href: 'release/autorelease',
        },
      ],
    },
    {
      name: 'CI',
      links: [
        {
          title: 'Overview',
          href: 'ci/',
        },
        {
          title: 'Auto-release',
          href: 'ci/autorelease',
        },
      ],
    },
    {
      name: 'Pre-commit',
      links: [
        {
          title: 'Overview',
          href: 'lint/',
        },
        {
          title: 'Husky',
          href: 'precommit/husky',
        },
        {
          title: 'Lintstaged',
          href: 'precommit/lintstaged',
        },
      ],
    },
    {
      name: 'Other commands',
      links: ['compress', 'readme'],
    },
  ],
};
