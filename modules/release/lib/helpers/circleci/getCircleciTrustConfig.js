import { _ } from 'golgoth';
import { sleep, spinner } from 'firost';
import { callApi } from './callApi.js';
import { getOrgAndRepo } from './getOrgAndRepo.js';

const retryInterval = 5000;

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

  const circleciPipelineDefinitionId =
    await __.waitForPipelineDefinition(circleciProjectId);

  const vcsOrigin = `github.com/${org}/${repo}`;

  return {
    circleciOrgId,
    circleciProjectId,
    circleciPipelineDefinitionId,
    vcsOrigin,
  };
}

__ = {
  /**
   * Fetch pipeline-definitions once, poll if not yet available
   * @param {string} projectId - CircleCI project UUID
   * @returns {string} Pipeline definition ID
   */
  async waitForPipelineDefinition(projectId) {
    const items = await __.fetchPipelineDefItems(projectId);

    // Got it on the first try \o/
    if (!_.isEmpty(items)) {
      return items[0].id;
    }

    // Wait for pipeline to be created
    const progress = __.spinner();
    return await __.pollPipelineDefinition(projectId, progress);
  },

  /**
   * Retry loop: tick spinner, sleep, fetch, repeat until items appear
   * @param {string} projectId - CircleCI project UUID
   * @param {object} progress - Spinner instance
   * @returns {string} Pipeline definition ID
   */
  async pollPipelineDefinition(projectId, progress) {
    progress.tick('Waiting for CircleCI pipeline definition...');
    await __.sleep(retryInterval);

    const items = await __.fetchPipelineDefItems(projectId);

    if (!_.isEmpty(items)) {
      progress.success('Pipeline definition found');
      return items[0].id;
    }

    return await __.pollPipelineDefinition(projectId, progress);
  },

  /**
   * Fetch pipeline definition items from the API
   * @param {string} projectId - CircleCI project UUID
   * @returns {Array} Pipeline definition items (may be empty)
   */
  async fetchPipelineDefItems(projectId) {
    const pipelineData = await __.callApi(
      `projects/${projectId}/pipeline-definitions`,
    );
    return _.get(pipelineData, 'items', []);
  },

  callApi,
  getOrgAndRepo,
  sleep,
  spinner,
};
