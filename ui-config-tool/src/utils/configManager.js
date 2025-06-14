/**
 * configManager.js
 * Central configuration management utility for the UI tool
 */

import { Validation } from './validation.js';

export class ConfigManager {
    constructor() {
        this.validation = new Validation();
        this.providers = [];
        this.models = [];
        this.storageKey = 'taskmaster-ui-config';
        this.projectPathKey = 'taskmaster-project-path';
        this.taskmasterProjectPath = null;
        this.isValidProject = false;
    }

    async loadConfiguration() {
        try {
            // Initialize project path first
            await this.initializeProjectPath();

            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const config = JSON.parse(stored);
                this.providers = config.providers || [];
                this.models = config.models || [];
            }

            // Load default configurations if empty
            if (this.providers.length === 0) {
                await this.loadDefaultProviders();
            }

            return true;
        } catch (error) {
            console.error('Failed to load configuration:', error);
            throw error;
        }
    }

    async saveConfiguration() {
        try {
            const config = {
                providers: this.providers,
                models: this.models,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(config));
            return true;
        } catch (error) {
            console.error('Failed to save configuration:', error);
            throw error;
        }
    }

    async resetConfiguration() {
        try {
            this.providers = [];
            this.models = [];
            localStorage.removeItem(this.storageKey);
            await this.loadDefaultProviders();
            return true;
        } catch (error) {
            console.error('Failed to reset configuration:', error);
            throw error;
        }
    }

    async loadDefaultProviders() {
        const defaultProviders = [
            {
                id: 'provider_openai_default',
                name: 'OpenAI',
                endpoint: 'https://api.openai.com',
                type: 'openai',
                apiKey: '',
                isValid: false
            },
            {
                id: 'provider_anthropic_default',
                name: 'Anthropic',
                endpoint: 'https://api.anthropic.com',
                type: 'anthropic',
                apiKey: '',
                isValid: false
            },
            {
                id: 'provider_foapi_default',
                name: 'FoApi',
                endpoint: 'https://v2.voct.top',
                type: 'openai',
                apiKey: '',
                isValid: false
            }
        ];

        this.providers = defaultProviders;
        await this.saveConfiguration();
    }

    // Provider Management
    async getProviders() {
        return [...this.providers];
    }

    async addProvider(providerData) {
        const validationResult = this.validation.validateProvider(providerData);
        if (!validationResult.isValid) {
            throw new Error(`无效的服务商数据: ${validationResult.errors.join(', ')}`);
        }

        // Check for duplicate names
        if (this.providers.some(p => p.name === providerData.name && p.id !== providerData.id)) {
            throw new Error('服务商名称已存在');
        }

        this.providers.push(providerData);
        await this.saveConfiguration();
        return providerData;
    }

    async updateProvider(providerData) {
        const validationResult = this.validation.validateProvider(providerData);
        if (!validationResult.isValid) {
            throw new Error(`无效的服务商数据: ${validationResult.errors.join(', ')}`);
        }

        const index = this.providers.findIndex(p => p.id === providerData.id);
        if (index === -1) {
            throw new Error('服务商未找到');
        }

        // Check for duplicate names (excluding current provider)
        if (this.providers.some(p => p.name === providerData.name && p.id !== providerData.id)) {
            throw new Error('服务商名称已存在');
        }

        this.providers[index] = providerData;
        await this.saveConfiguration();
        return providerData;
    }

    async deleteProvider(providerId) {
        const index = this.providers.findIndex(p => p.id === providerId);
        if (index === -1) {
            throw new Error('服务商未找到');
        }

        // Remove associated models
        this.models = this.models.filter(m => m.providerId !== providerId);

        // Remove provider
        this.providers.splice(index, 1);
        await this.saveConfiguration();
        return true;
    }

    async testProvider(provider) {
        try {
            // Validate provider configuration
            const validationResult = this.validation.validateProvider(provider);
            if (!validationResult.isValid) {
                return false;
            }

            // Simulate API test (in real implementation, this would make an actual API call)
            if (!provider.endpoint || !provider.apiKey) {
                return false;
            }

            // Mock test - in real implementation, make a simple API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update provider status
            const index = this.providers.findIndex(p => p.id === provider.id);
            if (index !== -1) {
                this.providers[index].isValid = true;
                await this.saveConfiguration();
            }

            return true;
        } catch (error) {
            console.error('Provider test failed:', error);
            return false;
        }
    }

    // Model Management
    async getModels() {
        return [...this.models];
    }

    async addModel(modelData) {
        const validationResult = this.validation.validateModel(modelData);
        if (!validationResult.isValid) {
            throw new Error(`无效的模型数据: ${validationResult.errors.join(', ')}`);
        }

        // Check if provider exists
        if (!this.providers.find(p => p.id === modelData.providerId)) {
            throw new Error('服务商未找到');
        }

        // Check for duplicate model IDs within the same provider
        if (this.models.some(m =>
            m.modelId === modelData.modelId &&
            m.providerId === modelData.providerId &&
            m.id !== modelData.id
        )) {
            throw new Error('此服务商已存在相同的模型ID');
        }

        this.models.push(modelData);
        await this.saveConfiguration();
        return modelData;
    }

    async updateModel(modelData) {
        const validationResult = this.validation.validateModel(modelData);
        if (!validationResult.isValid) {
            throw new Error(`无效的模型数据: ${validationResult.errors.join(', ')}`);
        }

        const index = this.models.findIndex(m => m.id === modelData.id);
        if (index === -1) {
            throw new Error('模型未找到');
        }

        // Check if provider exists
        if (!this.providers.find(p => p.id === modelData.providerId)) {
            throw new Error('服务商未找到');
        }

        // Check for duplicate model IDs within the same provider (excluding current model)
        if (this.models.some(m =>
            m.modelId === modelData.modelId &&
            m.providerId === modelData.providerId &&
            m.id !== modelData.id
        )) {
            throw new Error('此服务商已存在相同的模型ID');
        }

        this.models[index] = modelData;
        await this.saveConfiguration();
        return modelData;
    }

    async deleteModel(modelId) {
        const index = this.models.findIndex(m => m.id === modelId);
        if (index === -1) {
            throw new Error('模型未找到');
        }

        this.models.splice(index, 1);
        await this.saveConfiguration();
        return true;
    }

    async testModel(model) {
        try {
            // Validate model configuration
            const validationResult = this.validation.validateModel(model);
            if (!validationResult.isValid) {
                return false;
            }

            // Get associated provider
            const provider = this.providers.find(p => p.id === model.providerId);
            if (!provider || !provider.isValid) {
                return false;
            }

            // Simulate model test (in real implementation, this would make an actual API call)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            return true;
        } catch (error) {
            console.error('Model test failed:', error);
            return false;
        }
    }

    // Import/Export
    async importConfiguration(providers, models) {
        try {
            // Validate all providers
            for (const provider of providers) {
                const validationResult = this.validation.validateProvider(provider);
                if (!validationResult.isValid) {
                    throw new Error(`无效的服务商 "${provider.name}": ${validationResult.errors.join(', ')}`);
                }
            }

            // Validate all models
            for (const model of models) {
                const validationResult = this.validation.validateModel(model);
                if (!validationResult.isValid) {
                    throw new Error(`无效的模型 "${model.name}": ${validationResult.errors.join(', ')}`);
                }
            }

            // Replace current configuration
            this.providers = providers;
            this.models = models;
            
            await this.saveConfiguration();
            return true;
        } catch (error) {
            console.error('Failed to import configuration:', error);
            throw error;
        }
    }

    async exportConfiguration() {
        return {
            providers: [...this.providers],
            models: [...this.models],
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    // Utility methods
    getProviderById(providerId) {
        return this.providers.find(p => p.id === providerId);
    }

    getModelById(modelId) {
        return this.models.find(m => m.id === modelId);
    }

    getModelsByProvider(providerId) {
        return this.models.filter(m => m.providerId === providerId);
    }

    getModelsByRole(role) {
        return this.models.filter(m => m.allowedRoles?.includes(role));
    }

    generateId(prefix = 'item') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // TaskMaster Project Path Management

    /**
     * Load the saved TaskMaster project path from localStorage
     * @returns {Promise<string|null>} The saved project path or null if not found
     */
    async loadSavedProjectPath() {
        try {
            const savedPath = localStorage.getItem(this.projectPathKey);
            if (savedPath) {
                this.taskmasterProjectPath = savedPath;
                this.isValidProject = await this.validateProjectPath(savedPath);
                return savedPath;
            }
            return null;
        } catch (error) {
            console.error('Failed to load saved project path:', error);
            return null;
        }
    }

    /**
     * Save the TaskMaster project path to localStorage
     * @param {string} projectPath - The project path to save
     * @returns {Promise<boolean>} Success status
     */
    async saveProjectPath(projectPath) {
        try {
            if (!projectPath) {
                localStorage.removeItem(this.projectPathKey);
                this.taskmasterProjectPath = null;
                this.isValidProject = false;
                return true;
            }

            const isValid = await this.validateProjectPath(projectPath);
            if (isValid) {
                localStorage.setItem(this.projectPathKey, projectPath);
                this.taskmasterProjectPath = projectPath;
                this.isValidProject = true;
                return true;
            } else {
                throw new Error('无效的 TaskMaster 项目路径');
            }
        } catch (error) {
            console.error('Failed to save project path:', error);
            throw error;
        }
    }

    /**
     * Validate if a given path is a valid TaskMaster project
     * @param {string} projectPath - The path to validate
     * @returns {Promise<boolean>} True if valid TaskMaster project
     */
    async validateProjectPath(projectPath) {
        try {
            if (!projectPath || typeof projectPath !== 'string') {
                return false;
            }

            // In browser environment, we can only do basic path validation
            // The actual file system validation will be done when user selects files

            // Check if path looks like a valid directory path
            const normalizedPath = projectPath.replace(/\\/g, '/');

            // Basic validation: should not be empty and should look like a path
            if (normalizedPath.length === 0) {
                return false;
            }

            // Check if it contains typical TaskMaster project indicators in the path name
            const pathLower = normalizedPath.toLowerCase();
            const hasTaskMasterIndicator = pathLower.includes('task-master') ||
                                         pathLower.includes('taskmaster') ||
                                         pathLower.includes('claude-task-master');

            // For now, we'll accept any non-empty path and let the user verify
            // by successfully importing/exporting files
            return true;
        } catch (error) {
            console.error('Error validating project path:', error);
            return false;
        }
    }

    /**
     * Get the current TaskMaster project path
     * @returns {string|null} The current project path
     */
    getProjectPath() {
        return this.taskmasterProjectPath;
    }

    /**
     * Check if the current project path is valid
     * @returns {boolean} True if project path is valid
     */
    isProjectValid() {
        return this.isValidProject;
    }

    /**
     * Get TaskMaster configuration file paths
     * @returns {object} Object containing configuration file paths
     */
    getTaskMasterConfigPaths() {
        if (!this.taskmasterProjectPath) {
            return null;
        }

        // Simple path joining for browser environment
        const basePath = this.taskmasterProjectPath.replace(/\\/g, '/').replace(/\/$/, '');

        return {
            supportedModels: `${basePath}/scripts/modules/supported-models.json`,
            config: `${basePath}/.taskmaster/config.json`,
            tasksDir: `${basePath}/.taskmaster/tasks`,
            docsDir: `${basePath}/.taskmaster/docs`
        };
    }

    /**
     * Initialize project path on startup
     * @returns {Promise<boolean>} True if project path was loaded and validated
     */
    async initializeProjectPath() {
        try {
            const savedPath = await this.loadSavedProjectPath();
            if (savedPath && this.isValidProject) {
                console.log('TaskMaster project loaded:', savedPath);
                return true;
            } else if (savedPath) {
                console.warn('Saved project path is no longer valid:', savedPath);
                // Clear invalid path
                await this.saveProjectPath(null);
            }
            return false;
        } catch (error) {
            console.error('Failed to initialize project path:', error);
            return false;
        }
    }
}
