/**
 * ConfigTransformer.js
 * Handles bidirectional transformation between UI tool format and TaskMaster format
 */

export class ConfigTransformer {
    constructor() {
        // Provider type mappings
        this.providerTypeMap = {
            'openai': 'openai',
            'anthropic': 'anthropic', 
            'google': 'google',
            'polo': 'openai',
            'foapi': 'openai',
            'perplexity': 'openai',
            'xai': 'openai',
            'openrouter': 'openai'
        };

        // Default endpoints for known providers
        this.defaultEndpoints = {
            'openai': 'https://api.openai.com',
            'anthropic': 'https://api.anthropic.com',
            'google': 'https://generativelanguage.googleapis.com',
            'polo': 'https://api.polo.ai',
            'foapi': 'https://v2.voct.top',
            'perplexity': 'https://api.perplexity.ai',
            'xai': 'https://api.x.ai',
            'openrouter': 'https://openrouter.ai/api'
        };
    }

    /**
     * Transform UI configuration to TaskMaster format
     * @param {Array} providers - UI providers array
     * @param {Array} models - UI models array
     * @returns {Object} TaskMaster configuration object
     */
    uiToTaskMaster(providers, models) {
        const result = {
            supportedModels: {},
            config: {
                models: {},
                providers: {}
            }
        };

        // Group models by provider and build supported-models.json structure
        providers.forEach(provider => {
            const providerModels = models.filter(model => model.providerId === provider.id);
            
            if (providerModels.length > 0) {
                const providerKey = this.getProviderKey(provider);
                result.supportedModels[providerKey] = providerModels.map(model => ({
                    id: model.modelId,
                    swe_score: model.sweScore ? model.sweScore / 100 : null,
                    cost_per_1m_tokens: {
                        input: model.costPer1MTokens?.input || 0,
                        output: model.costPer1MTokens?.output || 0
                    },
                    allowed_roles: model.allowedRoles || ["main", "fallback"],
                    max_tokens: model.maxTokens || 200000
                }));
            }
        });

        // Build config.json structure
        // Set active models
        const mainModels = models.filter(m => m.allowedRoles?.includes('main'));
        if (mainModels.length > 0) {
            const mainModel = mainModels[0];
            const provider = providers.find(p => p.id === mainModel.providerId);
            if (provider) {
                result.config.models.main = {
                    provider: this.getProviderKey(provider),
                    model: mainModel.modelId
                };
            }
        }

        const fallbackModels = models.filter(m => m.allowedRoles?.includes('fallback'));
        if (fallbackModels.length > 0) {
            const fallbackModel = fallbackModels[0];
            const provider = providers.find(p => p.id === fallbackModel.providerId);
            if (provider) {
                result.config.models.fallback = {
                    provider: this.getProviderKey(provider),
                    model: fallbackModel.modelId
                };
            }
        }

        const researchModels = models.filter(m => m.allowedRoles?.includes('research'));
        if (researchModels.length > 0) {
            const researchModel = researchModels[0];
            const provider = providers.find(p => p.id === researchModel.providerId);
            if (provider) {
                result.config.models.research = {
                    provider: this.getProviderKey(provider),
                    model: researchModel.modelId
                };
            }
        }

        // Add provider configurations
        providers.forEach(provider => {
            const providerKey = this.getProviderKey(provider);
            result.config.providers[providerKey] = {
                name: provider.name,
                endpoint: provider.endpoint,
                type: provider.type,
                apiKey: provider.apiKey
            };
        });

        return result;
    }

    /**
     * Transform TaskMaster configuration to UI format
     * @param {Object} taskMasterConfig - TaskMaster configuration object
     * @returns {Object} UI configuration object with providers and models arrays
     */
    taskMasterToUi(taskMasterConfig) {
        const providers = [];
        const models = [];
        const providerIdMap = new Map(); // Map provider keys to generated IDs

        // Extract providers from supported models and config
        const supportedModels = taskMasterConfig.supportedModels || {};
        const config = taskMasterConfig.config || {};
        const configProviders = config.providers || {};

        // Create providers from supported models
        Object.keys(supportedModels).forEach(providerKey => {
            const providerId = this.generateId('provider');
            providerIdMap.set(providerKey, providerId);

            const configProvider = configProviders[providerKey] || {};
            
            const provider = {
                id: providerId,
                name: configProvider.name || this.getProviderDisplayName(providerKey),
                endpoint: configProvider.endpoint || this.getDefaultEndpoint(providerKey),
                type: configProvider.type || this.getProviderType(providerKey),
                apiKey: configProvider.apiKey || '',
                isValid: !!configProvider.apiKey
            };
            providers.push(provider);

            // Create models for this provider
            const providerModels = supportedModels[providerKey];
            providerModels.forEach(modelData => {
                const model = {
                    id: this.generateId('model'),
                    name: this.getModelDisplayName(modelData.id),
                    providerId: providerId,
                    modelId: modelData.id,
                    sweScore: modelData.swe_score ? modelData.swe_score * 100 : null,
                    maxTokens: modelData.max_tokens || 200000,
                    costPer1MTokens: {
                        input: modelData.cost_per_1m_tokens?.input || 0,
                        output: modelData.cost_per_1m_tokens?.output || 0
                    },
                    allowedRoles: modelData.allowed_roles || ["main", "fallback"]
                };
                models.push(model);
            });
        });

        return { providers, models };
    }

    /**
     * Get provider key from provider object
     * @param {Object} provider - Provider object
     * @returns {string} Provider key
     */
    getProviderKey(provider) {
        // Convert provider name to key format (lowercase, no special chars)
        return provider.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    /**
     * Get provider display name from key
     * @param {string} providerKey - Provider key
     * @returns {string} Display name
     */
    getProviderDisplayName(providerKey) {
        const nameMap = {
            'openai': 'OpenAI',
            'anthropic': 'Anthropic',
            'google': 'Google',
            'polo': 'PoloAI',
            'foapi': 'FoApi',
            'perplexity': 'Perplexity',
            'xai': 'xAI',
            'openrouter': 'OpenRouter'
        };
        return nameMap[providerKey] || providerKey.charAt(0).toUpperCase() + providerKey.slice(1);
    }

    /**
     * Get default endpoint for provider key
     * @param {string} providerKey - Provider key
     * @returns {string} Default endpoint
     */
    getDefaultEndpoint(providerKey) {
        return this.defaultEndpoints[providerKey] || '';
    }

    /**
     * Get provider type from key
     * @param {string} providerKey - Provider key
     * @returns {string} Provider type
     */
    getProviderType(providerKey) {
        return this.providerTypeMap[providerKey] || 'openai';
    }

    /**
     * Get model display name from model ID
     * @param {string} modelId - Model ID
     * @returns {string} Display name
     */
    getModelDisplayName(modelId) {
        // Extract a display name from model ID
        const parts = modelId.split('/');
        const name = parts[parts.length - 1];
        return name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Generate unique ID
     * @param {string} prefix - ID prefix
     * @returns {string} Generated ID
     */
    generateId(prefix = 'item') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Validate UI configuration
     * @param {Array} providers - Providers array
     * @param {Array} models - Models array
     * @returns {Object} Validation result
     */
    validateUiConfig(providers, models) {
        const errors = [];

        // Validate providers
        providers.forEach((provider, index) => {
            if (!provider.name) errors.push(`Provider ${index + 1}: Name is required`);
            if (!provider.endpoint) errors.push(`Provider ${index + 1}: Endpoint is required`);
            if (!provider.type) errors.push(`Provider ${index + 1}: Type is required`);
        });

        // Validate models
        models.forEach((model, index) => {
            if (!model.name) errors.push(`Model ${index + 1}: Name is required`);
            if (!model.modelId) errors.push(`Model ${index + 1}: Model ID is required`);
            if (!model.providerId) errors.push(`Model ${index + 1}: Provider ID is required`);
            
            // Check if provider exists
            if (!providers.find(p => p.id === model.providerId)) {
                errors.push(`Model ${index + 1}: Referenced provider not found`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate TaskMaster configuration
     * @param {Object} taskMasterConfig - TaskMaster configuration
     * @returns {Object} Validation result
     */
    validateTaskMasterConfig(taskMasterConfig) {
        const errors = [];

        if (!taskMasterConfig.supportedModels) {
            errors.push('Missing supportedModels section');
        } else {
            // Validate supported models structure
            Object.keys(taskMasterConfig.supportedModels).forEach(providerKey => {
                const models = taskMasterConfig.supportedModels[providerKey];
                if (!Array.isArray(models)) {
                    errors.push(`Provider ${providerKey}: Models must be an array`);
                } else {
                    models.forEach((model, index) => {
                        if (!model.id) errors.push(`Provider ${providerKey}, Model ${index + 1}: ID is required`);
                    });
                }
            });
        }

        if (!taskMasterConfig.config) {
            errors.push('Missing config section');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
