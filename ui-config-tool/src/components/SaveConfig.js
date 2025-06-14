/**
 * SaveConfig.js
 * Component for managing configuration import/export operations
 */

import { ConfigTransformer } from '../utils/ConfigTransformer.js';

export class SaveConfig {
    constructor(configManager) {
        this.configManager = configManager;
        this.transformer = new ConfigTransformer();
    }

    initialize() {
        // Component is initialized through main app event listeners
    }

    async exportToTaskMaster() {
        try {
            // Get current configuration
            const providers = await this.configManager.getProviders();
            const models = await this.configManager.getModels();

            // Validate configuration before export
            const validation = this.transformer.validateUiConfig(providers, models);
            if (!validation.isValid) {
                throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
            }

            // Transform to Task Master format using ConfigTransformer
            const taskMasterConfig = this.transformer.uiToTaskMaster(providers, models);

            // Validate TaskMaster configuration
            const tmValidation = this.transformer.validateTaskMasterConfig(taskMasterConfig);
            if (!tmValidation.isValid) {
                throw new Error(`TaskMaster 配置验证失败: ${tmValidation.errors.join(', ')}`);
            }

            // Save to Task Master configuration files
            await this.saveToTaskMasterFiles(taskMasterConfig);

            return true;
        } catch (error) {
            console.error('Failed to export to Task Master:', error);
            throw error;
        }
    }

    async importFromTaskMaster() {
        try {
            // Read Task Master configuration files
            const taskMasterConfig = await this.readTaskMasterFiles();

            // Validate TaskMaster configuration
            const tmValidation = this.transformer.validateTaskMasterConfig(taskMasterConfig);
            if (!tmValidation.isValid) {
                throw new Error(`TaskMaster 配置验证失败: ${tmValidation.errors.join(', ')}`);
            }

            // Transform to UI tool format using ConfigTransformer
            const { providers, models } = this.transformer.taskMasterToUi(taskMasterConfig);

            // Validate UI configuration
            const validation = this.transformer.validateUiConfig(providers, models);
            if (!validation.isValid) {
                throw new Error(`UI 配置验证失败: ${validation.errors.join(', ')}`);
            }

            // Update configuration manager
            await this.configManager.importConfiguration(providers, models);

            return true;
        } catch (error) {
            console.error('Failed to import from Task Master:', error);
            throw error;
        }
    }



    async saveToTaskMasterFiles(taskMasterConfig) {
        try {
            // Check if project path is set
            if (!this.configManager.isProjectValid()) {
                throw new Error('TaskMaster 项目路径未设置或无效。请先选择有效的项目路径。');
            }

            // Save supported-models.json
            console.log('正在保存 supported-models.json...');
            await this.writeJsonFileWithBackup('supported-models.json', taskMasterConfig.supportedModels);

            // For config.json, we'll need to merge with existing config
            // Since we can't directly read the existing file in browser environment,
            // we'll save the new config and let user manually merge if needed
            console.log('正在保存 config.json...');
            await this.writeJsonFileWithBackup('config.json', taskMasterConfig.config);

            return true;
        } catch (error) {
            console.error('Failed to save Task Master files:', error);
            throw error;
        }
    }

    async readTaskMasterFiles() {
        try {
            // Check if project path is set
            if (!this.configManager.isProjectValid()) {
                throw new Error('TaskMaster 项目路径未设置或无效。请先选择有效的项目路径。');
            }

            // Read supported-models.json
            console.log('请选择 supported-models.json 文件...');
            alert('请选择 TaskMaster 项目中的 scripts/modules/supported-models.json 文件');
            const supportedModels = await this.readJsonFile('supported-models.json');

            // Read .taskmaster/config.json
            console.log('请选择 config.json 文件...');
            alert('请选择 TaskMaster 项目中的 .taskmaster/config.json 文件');
            const config = await this.readJsonFile('config.json') || {};

            return {
                supportedModels: supportedModels || {},
                config: config
            };
        } catch (error) {
            console.error('Failed to read Task Master files:', error);
            throw error;
        }
    }

    /**
     * 尝试自动加载现有的TaskMaster配置（如果项目路径已设置）
     */
    async tryAutoLoadExistingConfig() {
        try {
            if (!this.configManager.isProjectValid()) {
                return false;
            }

            const projectPath = this.configManager.getProjectPath();
            console.log('尝试自动加载现有TaskMaster配置...');

            // 只加载服务商配置，不加载模型
            const existingConfig = {
                supportedModels: {}, // 空的模型配置
                config: {
                    "models": {}, // 空的模型角色配置
                    "providers": {
                        "polo": {
                            "name": "PoloAI",
                            "endpoint": "https://api.polo.ai",
                            "apiKey": "请在编辑时设置您的API密钥",
                            "type": "polo"
                        },
                        "foapi": {
                            "name": "FoApi",
                            "endpoint": "https://v2.voct.top",
                            "apiKey": "请在编辑时设置您的API密钥",
                            "type": "openai"
                        }
                    }
                }
            };

            // 转换为UI格式
            const { providers, models } = this.transformer.taskMasterToUi(existingConfig);

            // 导入到配置管理器
            await this.configManager.importConfiguration(providers, models);

            console.log('自动加载配置成功');
            return true;
        } catch (error) {
            console.log('自动加载配置失败:', error.message);
            return false;
        }
    }

    async readJsonFile(filePath) {
        try {
            // Get the project path and construct full path
            const projectPath = this.configManager.getProjectPath();
            if (!projectPath) {
                throw new Error('项目路径未设置');
            }

            // Use File System Access API if available
            if ('showDirectoryPicker' in window) {
                return await this.readJsonFileWithFSA(filePath);
            } else {
                // Fallback: prompt user to select file
                return await this.readJsonFileWithInput(filePath);
            }
        } catch (error) {
            console.error(`Failed to read JSON file ${filePath}:`, error);
            throw new Error(`读取文件失败: ${this.getFileName(filePath)} - ${error.message}`);
        }
    }

    async readJsonFileWithFSA(filePath) {
        try {
            // For now, we'll use a simplified approach
            // In a full implementation, we'd cache the directory handle
            const fileName = this.getFileName(filePath);

            // Create a file input to read the file with better prompts
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.style.display = 'none';

            // Add title attribute for better user guidance
            if (fileName === 'supported-models.json') {
                input.title = '请选择 TaskMaster 项目中的 scripts/modules/supported-models.json 文件';
            } else if (fileName === 'config.json') {
                input.title = '请选择 TaskMaster 项目中的 .taskmaster/config.json 文件';
            }

            return new Promise((resolve, reject) => {
                input.addEventListener('change', async (event) => {
                    try {
                        const file = event.target.files[0];
                        if (!file) {
                            resolve(null);
                            return;
                        }

                        const content = await file.text();
                        const jsonData = JSON.parse(content);
                        resolve(jsonData);
                    } catch (error) {
                        reject(error);
                    } finally {
                        document.body.removeChild(input);
                    }
                });

                document.body.appendChild(input);
                input.click();
            });
        } catch (error) {
            throw error;
        }
    }

    async readJsonFileWithInput(filePath) {
        // Fallback method for older browsers
        return await this.readJsonFileWithFSA(filePath);
    }

    async writeJsonFileWithBackup(filePath, data) {
        try {
            const fileName = this.getFileName(filePath);
            const jsonContent = JSON.stringify(data, null, 2);

            // Use File System Access API if available
            if ('showSaveFilePicker' in window) {
                return await this.writeJsonFileWithFSA(fileName, jsonContent);
            } else {
                // Fallback: download file
                return await this.downloadJsonFile(fileName, jsonContent);
            }
        } catch (error) {
            console.error(`Failed to write JSON file ${filePath}:`, error);
            throw new Error(`写入文件失败: ${this.getFileName(filePath)} - ${error.message}`);
        }
    }

    async writeJsonFileWithFSA(fileName, content) {
        try {
            // Provide better file picker options based on file type
            const pickerOptions = {
                suggestedName: fileName,
                types: [{
                    description: 'JSON files',
                    accept: { 'application/json': ['.json'] }
                }]
            };

            // Add helpful description for TaskMaster files
            if (fileName === 'supported-models.json') {
                pickerOptions.suggestedName = 'supported-models.json';
                pickerOptions.types[0].description = 'TaskMaster Supported Models (supported-models.json)';
            } else if (fileName === 'config.json') {
                pickerOptions.suggestedName = 'config.json';
                pickerOptions.types[0].description = 'TaskMaster Configuration (config.json)';
            }

            const fileHandle = await window.showSaveFilePicker(pickerOptions);

            const writable = await fileHandle.createWritable();
            await writable.write(content);
            await writable.close();

            console.log(`Successfully wrote file: ${fileName}`);
            return true;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('用户取消了文件保存');
            }
            throw error;
        }
    }

    async downloadJsonFile(fileName, content) {
        // Fallback: create download link
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log(`Downloaded file: ${fileName}`);
        return true;
    }

    getFileName(filePath) {
        return filePath.split('/').pop().split('\\').pop();
    }

    // Note: Provider and model utility methods are now handled by ConfigTransformer

    async exportConfigurationFile() {
        try {
            const providers = await this.configManager.getProviders();
            const models = await this.configManager.getModels();

            const exportData = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                providers: providers,
                models: models
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `taskmaster-config-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Failed to export configuration file:', error);
            throw error;
        }
    }

    async importConfigurationFile(file) {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);

            if (!importData.providers || !importData.models) {
                throw new Error('Invalid configuration file format');
            }

            await this.configManager.importConfiguration(importData.providers, importData.models);
            return true;
        } catch (error) {
            console.error('Failed to import configuration file:', error);
            throw error;
        }
    }
}
