// Main injector class
class DiscordInjector {
  constructor() {
    this.modules = new Map();
    this.storage = {};
    this.setupStorage();
    this.setupMessageHandling();
  }

  // Initialize storage
  async setupStorage() {
    const data = await chrome.storage.local.get(null);
    this.storage = data || {};

    // Migrate any existing localStorage data
    const lsKeys = Object.keys(localStorage).filter(k => k.startsWith('discord_enhanced_'));
    if (lsKeys.length > 0) {
      const migrateData = {};
      for (const key of lsKeys) {
        migrateData[key] = localStorage.getItem(key);
        localStorage.removeItem(key);
      }
      Object.assign(this.storage, migrateData);
      await chrome.storage.local.set(migrateData);
    }
  }

  // Setup message handling between content script and page
  setupMessageHandling() {
    // Listen for storage get requests
    document.addEventListener('des_get', () => {
      document.dispatchEvent(new CustomEvent('des_get_return', {
        detail: this.storage
      }));
    });

    // Listen for storage set requests
    document.addEventListener('des_set', ({ detail: { key, value }}) => {
      this.storage[key] = value;
      const data = {};
      data[key] = value;
      chrome.storage.local.set(data);
    });

    // Handle module loading
    document.addEventListener('des_load_module', ({ detail: module }) => {
      this.loadModule(module);
    });
  }

  // Load a module into Discord
  async loadModule(moduleData) {
    try {
      // Create module wrapper
      const wrapped = `
        (function() {
          const module = ${JSON.stringify(moduleData)};
          
          // Module API
          const api = {
            storage: {
              get: (key) => {
                document.dispatchEvent(new CustomEvent('des_get'));
                return new Promise(resolve => {
                  document.addEventListener('des_get_return', (e) => {
                    resolve(e.detail[key]);
                  }, { once: true });
                });
              },
              set: (key, value) => {
                document.dispatchEvent(new CustomEvent('des_set', {
                  detail: { key, value }
                }));
              }
            },
            
            // Discord API utilities
            discord: {
              getModule: (filter) => {
                return window.webpackChunkdiscord_app.push([[Math.random()], {}, (req) => {
                  for (const m of Object.values(req.c)) {
                    if (m?.exports && filter(m.exports)) return m.exports;
                  }
                }]);
              },
              
              getModuleByProps: (...props) => {
                return api.discord.getModule(m => props.every(p => m?.[p] !== undefined));
              }
            }
          };

          // Execute module code
          try {
            const moduleFunc = ${moduleData.code};
            moduleFunc(api);
          } catch (e) {
            console.error('[Discord Enhancement] Module error:', e);
          }
        })();
      `;

      // Inject the wrapped module
      const script = document.createElement('script');
      script.textContent = wrapped;
      document.body.appendChild(script);
      script.remove();

    } catch (e) {
      console.error('[Discord Enhancement] Failed to load module:', e);
    }
  }

  // Initialize the injector
  async initialize() {
    // Wait for Discord to load
    await new Promise(resolve => {
      const check = setInterval(() => {
        if (document.querySelector('[class*="app-"]')) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });

    // Inject core
    this.injectCore();
    
    // Load saved modules
    const modules = this.storage.enabled_modules || [];
    for (const module of modules) {
      await this.loadModule(module);
    }
  }

  // Inject core functionality
  injectCore() {
    const core = {
      name: 'Core',
      version: '1.0.0',
      code: function(api) {
        window.DiscordEnhancement = {
          api,
          modules: new Map(),
          
          registerModule: (module) => {
            window.DiscordEnhancement.modules.set(module.name, module);
            document.dispatchEvent(new CustomEvent('des_load_module', {
              detail: module
            }));
          }
        };
      }
    };

    this.loadModule(core);
  }
}

// Initialize the injector
const injector = new DiscordInjector();
injector.initialize();