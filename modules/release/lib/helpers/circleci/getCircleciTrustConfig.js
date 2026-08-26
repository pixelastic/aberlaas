import { getEnvToken } from './getEnvToken.js';
import { getOrgAndRepo } from './getOrgAndRepo.js';

export let __;

/**
 * Fetch CircleCI trust config (org ID, project ID, pipeline definition ID)
 * @returns {object} { circleciOrgId, circleciProjectId, circleciPipelineDefinitionId, vcsOrigin }
 */
export async function getCircleciTrustConfig() {
  const { org, repo } = await __.getOrgAndRepo();

  const projectData = await __.api(`gh/${org}/${repo}`);
  const circleciOrgId = projectData.organization_id;
  const circleciProjectId = projectData.id;

  const pipelineData = await __.api(
    `${circleciProjectId}/pipeline-definitions`,
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
  /**
   * Call the CircleCI API v2 project endpoint
   * @param {string} path - Path after /api/v2/project/
   * @returns {object} Parsed JSON response
   */
  async api(path) {
    const token = getEnvToken();
    const response = await __.fetch(
      `https://circleci.com/api/v2/project/${path}`,
      { headers: { Authorization: `Circle-Token ${token}` } },
    );
    return await response.json();
  },

  getOrgAndRepo,
  fetch,
};
