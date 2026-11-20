import { absolute } from 'firost';

/**
 * Returns the absolute path to the default template shipped with aberlaas
 * @returns {string} Absolute path to the default template
 */
export function getTemplatePath() {
  return absolute('../templates/README.template.md');
}
