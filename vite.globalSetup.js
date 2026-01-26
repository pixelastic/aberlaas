/**
 * We override the git commit author name, so our tests using git are
 * reproducible.
 */
export default function () {
  process.env.GIT_AUTHOR_NAME = 'Aberlaas';
  process.env.GIT_AUTHOR_EMAIL = 'sov@aberlaas.com';
  process.env.GIT_AUTHOR_DATE = 'Thu, 30 Aug 2018 16:43:00 +0200';

  process.env.GIT_COMMITTER_NAME = process.env.GIT_AUTHOR_NAME;
  process.env.GIT_COMMITTER_EMAIL = process.env.GIT_AUTHOR_EMAIL;
  process.env.GIT_COMMITTER_DATE = process.env.GIT_AUTHOR_DATE;
}
