import { callApi } from './callApi.js';
import { getOrgAndRepo } from './getOrgAndRepo.js';

export let __;

/**
 * Fetch CircleCI trust config (org ID, project ID, pipeline definition ID)
 * @returns {object} { circleciOrgId, circleciProjectId, circleciPipelineDefinitionId, vcsOrigin }
 */
export async function getCircleciTrustConfig() {
  const { org, repo } = await __.getOrgAndRepo();

  const projectData = await __.callApi(`project/gh/${org}/${repo}`);
  const circleciOrgId = projectData.organization_id;
  const circleciProjectId = projectData.id;

  const pipelineData = await __.callApi(
    `project/${circleciProjectId}/pipeline-definitions`,
  );
  const circleciPipelineDefinitionId = pipelineData.items[0].id;

  const vcsOrigin = `github/${org}/${repo}`;

  return {
    circleciOrgId,
    circleciProjectId,
    circleciPipelineDefinitionId,
    vcsOrigin,
  };
}

__ = {
  callApi,
  getOrgAndRepo,
};
