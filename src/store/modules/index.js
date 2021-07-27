// source: https://github.com/chrisvfritz/vue-enterprise-boilerplate/blob/master/src/state/modules/index.js

// Register each file as a corresponding Vuex module. Module nesting
// will mirror [sub-]directory hierarchy and modules are namespaced

const modulesCache = {};
const storeData = { modules: {} };

// Recursively get the namespace of a Vuex module, even if nested.
function getNamespace(subtree, path) {
  if (path.length === 1) return subtree;

  const namespace = path.shift();
  // eslint-disable-next-line no-param-reassign
  subtree.modules[namespace] = {
    modules: {},
    namespaced: true,
    ...subtree.modules[namespace],
  };
  return getNamespace(subtree.modules[namespace], path);
}

(function updateModules() {
  // Allow us to dynamically require all Vuex module files.
  // https://webpack.js.org/guides/dependency-management/#require-context
  const requireModule = require.context(
    // Search for files in the current directory.
    '.',
    // Search for files in subdirectories.
    true,
    // Include any .js files that are not this file or a unit test.
    /^((?!index|\.unit\.).)*\.js$/,
  );

  // For every Vuex module...
  requireModule.keys().forEach((fileName) => {
    const moduleDefinition = requireModule(fileName).default || requireModule(fileName);

    // Skip the module during hot reload if it refers to the
    // same module definition as the one we have cached.
    if (modulesCache[fileName] === moduleDefinition) return;

    // Update the module cache, for efficient hot reloading.
    modulesCache[fileName] = moduleDefinition;

    // Get the module path as an array.
    const modulePath = fileName
      // Remove the "./" from the beginning.
      .replace(/^\.\//, '')
      // Remove the file extension from the end.
      .replace(/\.\w+$/, '')
      // Split nested modules into an array path.
      .split(/\//);

    // Get the modules object for the current path.
    const { modules } = getNamespace(storeData, modulePath);

    // Add the module to our modules object.
    modules[modulePath.pop()] = {
      // Modules are namespaced by default.
      namespaced: true,
      ...moduleDefinition,
    };
  });

  // If the environment supports hot reloading...
  if (module.hot) {
    // Whenever any Vuex module is updated...
    module.hot.accept(requireModule.id, () => {
      // Update `storeData.modules` with the latest definitions.
      updateModules();
      // Trigger a hot update in the store.
      // eslint-disable-next-line global-require
      require('../index').default.hotUpdate({ modules: storeData.modules });
    });
  }
}());

export default storeData.modules;

const INIT = 'init';

export const dispatchModulesInit = (store, modules, {
  modulePrefix = '',
  flags = {},
} = {}) => {
  // For every module...
  Object.keys(modules).forEach((moduleName) => {
    const moduleDefinition = modules[moduleName];

    // If the action is defined on the module...
    if (moduleDefinition.actions && moduleDefinition.actions[INIT]) {
      // Dispatch the action if the module is namespaced. Otherwise,
      // set a flag to dispatch the action globally at the end.
      if (moduleDefinition.namespaced) {
        store.dispatch(`${modulePrefix}${moduleName}/${INIT}`);
      } else {
        // eslint-disable-next-line no-param-reassign
        flags.dispatchGlobal = true;
      }
    }

    // If there are any nested sub-modules...
    if (moduleDefinition.modules) {
      // Also dispatch the action for these sub-modules.
      dispatchModulesInit(store, moduleDefinition.modules, { modulePrefix: `${modulePrefix + moduleName}/`, flags });
    }
  });
};