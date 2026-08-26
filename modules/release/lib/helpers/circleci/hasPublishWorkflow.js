import { read } from 'firost';
import { hostGitPath } from 'aberlaas-helper';
import YAML from 'yaml';

/**
 * Check if the CircleCI config already has a trusted-publish workflow
 * @returns {boolean} True if trusted-publish workflow exists
 */
export async function hasPublishWorkflow() {
  const content = await read(hostGitPath('.circleci/config.yml'));
  const doc = YAML.parseDocument(content);
  const workflows = doc.get('workflows');
  return workflows.has('trusted-publish');
}
