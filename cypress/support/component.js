// ***********************************************************
// This example support/component.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands';
import plugins from '../../src/plugins.js';
import { createAppInstance } from '../../src/setup.js';
import { mount } from 'cypress/vue';

import 'primevue/resources/primevue.css'; // primevue css
import 'primeicons/primeicons.css'; // icons
import 'primeflex/primeflex.scss'; // primeflex
import '../../src/assets/styles/theme-tailwind.css'; // base theme (pulled from Primevue)
import '../../src/assets/styles/theme.scss';

/**
 * Custom Cypress command to mount a Vue component with the application's full context.
 *
 * This command initializes the Vue app instance, adds the necessary plugins, components,
 * and directives to the Cypress context, and mounts the specified component for testing.
 *
 * The command ensures that all global plugins, components, and other context-specific
 * items from the Vue app are available in the Cypress testing environment. This includes
 * handling potential context duplication to ensure features like i18n work correctly.
 *
 * @param {VueComponent} component - The Vue component to mount.
 * @param {object} [options={}] - Optional configuration for mounting, including global plugins and components.
 * @returns {Cypress.Chainable} - The chainable Cypress object for further commands.
 */
Cypress.Commands.add('mount', (component, options = {}) => {
  const app = createAppInstance();

  options.global = options.global || {};
  options.global.plugins = options.global.plugins || [];
  options.global.components = options.global.components || {};

  // Add the Vue app plugins to the Cypress context
  plugins.forEach((plugin) => {
    if (Array.isArray(plugin)) {
      options.global.plugins.push(...plugin);
    } else {
      options.global.plugins.push(plugin);
    }
  });

  // There is some context duplication between loop above and this loop
  // But without this redundancy, some app context is not available in the Cypress context (namely i18n)
  // Unsure why, need to investigate further

  // Add the Vue app components, directives, and plugins to the Cypress context
  options.global.plugins.push({
    install(appInstance) {
      appInstance._context.components = app._context.components;
      appInstance._context.directives = app._context.directives;
      appInstance._context.provides = app._context.provides;
    },
  });

  return mount(component, options);
});
