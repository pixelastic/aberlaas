import { firostError, sleep, spinner } from 'firost';
import { callApi } from './callApi.js';

const pollInterval = 15 * 1000;

// CircleCI job statuses from OpenAPI spec: GET /api/v2/workflow/{id}/job
// Success: success
// Pending: queued, running, not_run, not_running, on_hold, blocked
// Failure:
const successStatuses = ['success'];
const failureStatuses = [
  'failed',
  'retried',
  'infrastructure_fail',
  'timedout',
  'terminated-unknown',
  'canceled',
  'unauthorized',
];

export let __;

/**
 * Poll a CircleCI pipeline until the trusted-publish workflow reaches a terminal state
 * @param {string} pipelineId - CircleCI pipeline UUID
 * @returns {Promise<void>}
 */
export async function pollPipelineStatus(pipelineId) {
  const progress = __.spinner();
  await __.checkOnce(pipelineId, progress);
}

__ = {
  /**
   * Single poll iteration: check status, resolve if terminal, schedule another check otherwise
   * @param {string} pipelineId - CircleCI pipeline UUID
   * @param {object} progress - Spinner instance
   * @returns {Promise<void>}
   */
  async checkOnce(pipelineId, progress) {
    const workflowData = await __.callApi(`pipeline/${pipelineId}/workflow`);
    const workflow = workflowData.items.find(
      (item) => item.name === 'trusted-publish',
    );

    // No workflow yet, wait for it
    if (!workflow) {
      progress.tick('Waiting for trusted-publish workflow...');
      await __.sleep(pollInterval);
      return await __.checkOnce(pipelineId, progress);
    }

    // Get the job
    const jobData = await __.callApi(`workflow/${workflow.id}/job`);
    const job = jobData.items[0];
    const status = job?.status || 'queued';

    progress.tick(`trusted-publish: ${status}`);

    // Done
    if (successStatuses.includes(status)) {
      progress.success('Trusted publish completed');
      return;
    }

    // Failed
    if (failureStatuses.includes(status)) {
      const jobUrl = __.getJobUrl(workflow, job);
      progress.failure(`Trusted publish ${status}`);
      throw firostError(
        'ABERLAAS_RELEASE_CI_PUBLISH_FAILED',
        `Trusted publish ${status}. See logs: ${jobUrl}`,
      );
    }

    // Still going
    await __.sleep(pollInterval);
    return await __.checkOnce(pipelineId, progress);
  },

  /**
   * Build the CircleCI job URL from workflow and job data
   * @param {object} workflow - Workflow object from CircleCI API
   * @param {object} job - Job object from CircleCI API
   * @returns {string} Full URL to the job logs
   */
  getJobUrl(workflow, job) {
    const { project_slug, pipeline_number, id: workflowId } = workflow;
    const { job_number } = job;
    return `https://app.circleci.com/pipelines/${project_slug}/${pipeline_number}/workflows/${workflowId}/jobs/${job_number}`;
  },

  callApi,
  sleep,
  spinner,
};
