import { read } from 'firost';
import { hostGitPath } from 'aberlaas-helper';
import YAML from 'yaml';

/**
 * Check if the CircleCI config already has a trusted-publish workflow
 * @returns {boolean} True if trusted-publish workflow exists. Also false when
 * workflows is missing or not a map
 */
export async function hasPublishWorkflow() {
  const content = await read(hostGitPath('.circleci/config.yml'));
  const doc = YAML.parseDocument(content);
  const workflows = doc.get('workflows', true);
  if (!YAML.isMap(workflows)) {
    return false;
  }
  return workflows.has('trusted-publish');
}
