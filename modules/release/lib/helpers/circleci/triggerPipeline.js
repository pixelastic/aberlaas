import { callApi } from './callApi.js';
import { getOrgAndRepo } from './getOrgAndRepo.js';

export let __;

/**
 * Trigger a CircleCI trusted-publish pipeline
 * @param {string} tag - Git tag to build (e.g. "v2.0.0")
 * @param {string[]} packages - Package names to publish
 * @returns {string} Pipeline ID
 */
export async function triggerPipeline(tag, packages) {
  const { org, repo } = await __.getOrgAndRepo();

  const data = await __.callApi(`project/gh/${org}/${repo}/pipeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tag,
      parameters: {
        trusted_publish: true,
        packages: packages.join(','),
      },
    }),
  });

  return data.id;
}

__ = {
  callApi,
  getOrgAndRepo,
};
