import { firostError } from 'firost';
import { callApi } from './callApi.js';
import { getOrgAndRepo } from './getOrgAndRepo.js';

export let __;

/**
 * Trigger a CircleCI trusted-publish pipeline
 * @param {string[]} packages - Package names to publish
 * @returns {string} Pipeline ID
 * @throws {Error} When CircleCI does not return a pipeline ID
 */
export async function triggerPipeline(packages) {
  const { org, repo } = await __.getOrgAndRepo();

  const data = await __.callApi(`project/gh/${org}/${repo}/pipeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Use branch instead of tag: CircleCI skips workflows for tag-triggered
      // pipelines unless jobs have explicit tag filters. The commit on main is
      // the same as the tag (just pushed), and pipeline parameters control
      // which workflow runs.
      branch: 'main',
      parameters: {
        trusted_publish: true,
        packages: packages.join(','),
      },
    }),
  });

  if (!data.id) {
    throw firostError(
      'ABERLAAS_RELEASE_CIRCLECI_NO_PIPELINE_ID',
      `CircleCI did not create a pipeline: ${JSON.stringify(data)}`,
    );
  }

  return data.id;
}

__ = {
  callApi,
  getOrgAndRepo,
};
