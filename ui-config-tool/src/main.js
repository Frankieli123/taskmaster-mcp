/**
 * main.js
 * Main application entry point for Task Master UI Configuration Tool
 */

import { ProviderConfig } from './components/ProviderConfig.js';
import { ModelConfig } from './components/ModelConfig.js';
import { SaveConfig } from './components/SaveConfig.js';
import { ConfigManager } from './utils/configManager.js';
import { TaskMasterTester } from './utils/TaskMasterTester.js';

class TaskMasterConfigApp {
    constructor() {
        this.configManager = new ConfigManager();
        this.providerConfig = new ProviderConfig(this.configManager);
        this.modelConfig = new ModelConfig(this.configManager);
        this.saveConfig = new SaveConfig(this.configManager);
        this.taskMasterTester = new TaskMasterTester(this.configManager, this.saveConfig.transformer);
        
        this.currentTab = 'providers';
        this.hasUnsavedChanges = false;
        
        this.init();
    }

    async init() {
        try {
            // Load existing configuration
            await this.configManager.loadConfiguration();

            // Initialize UI components
            this.initializeTabNavigation();
            this.initializeComponents();
            this.initializeEventListeners();

            // Update project path status
            this.updateProjectPathStatus();

            // Load initial data
            await this.loadInitialData();

            // Try to auto-load TaskMaster configuration if project path is valid
            await this.tryAutoLoadConfiguration();

            this.updateStatus('配置加载成功');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.updateStatus('配置加载失败', 'error');
        }
    }

    initializeTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // Update button states
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Update tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');

        this.currentTab = tabId;

        // 当切换到模型标签页时，重新渲染模型列表
        if (tabId === 'models') {
            setTimeout(() => {
                if (this.modelConfig) {
                    this.modelConfig.renderModels();
                }
            }, 50);
        }
    }

    initializeComponents() {
        // Initialize provider configuration
        this.providerConfig.initialize();
        
        // Initialize model configuration
        this.modelConfig.initialize();
        
        // Initialize save configuration
        this.saveConfig.initialize();
    }

    initializeEventListeners() {
        // Save button
        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveConfiguration();
        });

        // Add provider button
        document.getElementById('add-provider-btn').addEventListener('click', () => {
            this.providerConfig.showAddProviderModal();
        });

        // Add model button
        document.getElementById('add-model-btn').addEventListener('click', () => {
            this.modelConfig.showAddModelModal();
        });

        // Configuration actions
        document.getElementById('export-config-btn').addEventListener('click', () => {
            this.exportConfiguration();
        });

        document.getElementById('import-config-btn').addEventListener('click', () => {
            this.importConfiguration();
        });

        document.getElementById('reset-config-btn').addEventListener('click', () => {
            this.resetConfiguration();
        });

        // Project path selection
        document.getElementById('select-project-btn').addEventListener('click', () => {
            this.selectProjectPath();
        });

        document.getElementById('clear-project-btn').addEventListener('click', () => {
            this.clearProjectPath();
        });

        // 分离的测试按钮
        document.getElementById('test-providers-btn').addEventListener('click', () => {
            this.testAllProviders();
        });

        document.getElementById('test-models-api-btn').addEventListener('click', () => {
            this.testAllModelsAPI();
        });

        document.getElementById('test-taskmaster-btn').addEventListener('click', () => {
            this.testTaskMasterIntegration();
        });

        // Auto load config button
        document.getElementById('auto-load-config-btn').addEventListener('click', () => {
            this.autoLoadConfiguration();
        });

        // Listen for configuration changes
        document.addEventListener('configChanged', () => {
            this.hasUnsavedChanges = true;
            this.updateSaveButtonState();
        });

        // Warn before leaving with unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    async loadInitialData() {
        // Load providers
        await this.providerConfig.loadProviders();
        
        // Load models
        await this.modelConfig.loadModels();
        
        // Update UI
        this.updateSaveButtonState();
    }

    async saveConfiguration() {
        try {
            this.updateStatus('正在保存配置...', 'loading');

            await this.configManager.saveConfiguration();

            this.hasUnsavedChanges = false;
            this.updateSaveButtonState();
            this.updateStatus('配置保存成功', 'success');
        } catch (error) {
            console.error('Failed to save configuration:', error);
            this.updateStatus('配置保存失败', 'error');
        }
    }

    async exportConfiguration() {
        try {
            this.updateStatus('正在导出到 Task Master...', 'loading');

            await this.saveConfig.exportToTaskMaster();

            this.updateStatus('配置已成功导出到 Task Master', 'success');
        } catch (error) {
            console.error('Failed to export configuration:', error);
            this.updateStatus('配置导出失败', 'error');
        }
    }

    async importConfiguration() {
        try {
            this.updateStatus('正在从 Task Master 导入...', 'loading');

            await this.saveConfig.importFromTaskMaster();
            await this.loadInitialData();

            this.updateStatus('配置已成功从 Task Master 导入', 'success');
        } catch (error) {
            console.error('Failed to import configuration:', error);
            this.updateStatus('配置导入失败', 'error');
        }
    }

    async resetConfiguration() {
        if (!confirm('确定要重置所有配置吗？此操作无法撤销。')) {
            return;
        }

        try {
            this.updateStatus('正在重置配置...', 'loading');

            await this.configManager.resetConfiguration();
            await this.loadInitialData();

            this.hasUnsavedChanges = false;
            this.updateSaveButtonState();
            this.updateStatus('配置重置成功', 'success');
        } catch (error) {
            console.error('Failed to reset configuration:', error);
            this.updateStatus('配置重置失败', 'error');
        }
    }

    updateSaveButtonState() {
        const saveBtn = document.getElementById('save-btn');
        if (this.hasUnsavedChanges) {
            saveBtn.classList.add('btn-warning');
            saveBtn.classList.remove('btn-primary');
            saveBtn.innerHTML = '<span class="btn-icon">⚠️</span>保存更改';
        } else {
            saveBtn.classList.add('btn-primary');
            saveBtn.classList.remove('btn-warning');
            saveBtn.innerHTML = '<span class="btn-icon">💾</span>保存更改';
        }
    }

    updateStatus(message, type = 'info') {
        // 现在只使用Toast消息，不再使用底部状态栏
        this.showToast(message, type);

        // 在控制台记录状态信息
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    /**
     * 显示临时提示消息
     */
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // Add to page
        document.body.appendChild(toast);

        // Show with animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    // Project Path Management Methods

    async selectProjectPath() {
        try {
            // Create a file input for directory selection
            const input = document.createElement('input');
            input.type = 'file';
            input.webkitdirectory = true;
            input.style.display = 'none';

            input.addEventListener('change', async (event) => {
                const files = event.target.files;
                if (files.length > 0) {
                    // Get the directory path from the first file
                    const firstFile = files[0];
                    const pathParts = firstFile.webkitRelativePath.split('/');
                    const projectPath = firstFile.path ?
                        firstFile.path.substring(0, firstFile.path.lastIndexOf(firstFile.webkitRelativePath)) :
                        pathParts[0]; // Fallback for browsers that don't support file.path

                    await this.setProjectPath(projectPath);
                }
                document.body.removeChild(input);
            });

            document.body.appendChild(input);
            input.click();
        } catch (error) {
            console.error('Failed to select project path:', error);
            this.updateStatus('项目路径选择失败', 'error');
        }
    }

    async setProjectPath(projectPath) {
        try {
            this.updateStatus('正在验证项目路径...', 'loading');

            await this.configManager.saveProjectPath(projectPath);
            this.updateProjectPathStatus();

            this.updateStatus('项目路径设置成功', 'success');
        } catch (error) {
            console.error('Failed to set project path:', error);
            this.updateStatus('无效的 TaskMaster 项目路径', 'error');
        }
    }

    async clearProjectPath() {
        try {
            await this.configManager.saveProjectPath(null);
            this.updateProjectPathStatus();
            this.updateStatus('项目路径已清除', 'success');
        } catch (error) {
            console.error('Failed to clear project path:', error);
            this.updateStatus('项目路径清除失败', 'error');
        }
    }

    updateProjectPathStatus() {
        const pathElement = document.getElementById('project-path-display');
        const statusElement = document.getElementById('project-path-status');
        const exportBtn = document.getElementById('export-config-btn');
        const importBtn = document.getElementById('import-config-btn');

        const projectPath = this.configManager.getProjectPath();
        const isValid = this.configManager.isProjectValid();

        if (projectPath && isValid) {
            pathElement.textContent = projectPath;
            statusElement.textContent = '✅ 有效的 TaskMaster 项目';
            statusElement.className = 'project-status valid';
            exportBtn.disabled = false;
            importBtn.disabled = false;
        } else if (projectPath && !isValid) {
            pathElement.textContent = projectPath;
            statusElement.textContent = '❌ 无效的项目路径';
            statusElement.className = 'project-status invalid';
            exportBtn.disabled = true;
            importBtn.disabled = true;
        } else {
            pathElement.textContent = '未选择项目';
            statusElement.textContent = '⚠️ 请选择 TaskMaster 项目';
            statusElement.className = 'project-status warning';
            exportBtn.disabled = true;
            importBtn.disabled = true;
        }
    }

    /**
     * 测试所有API供应商
     */
    async testAllProviders() {
        try {
            this.updateStatus('正在测试所有API供应商...', 'loading');

            const providers = await this.configManager.getProviders();
            if (providers.length === 0) {
                this.updateStatus('❌ 没有配置的供应商可供测试', 'error');
                return;
            }

            let successCount = 0;
            const totalCount = providers.length;

            console.group('🔌 API供应商测试结果');

            for (const provider of providers) {
                try {
                    console.log(`测试供应商: ${provider.name}`);
                    const testResult = await this.providerConfig.validator.testProviderConnection(provider);

                    if (testResult.isValid) {
                        successCount++;
                        console.log(`✅ ${provider.name}: ${testResult.message}`);
                    } else {
                        console.error(`❌ ${provider.name}: ${testResult.errors.join(', ')}`);
                    }
                } catch (error) {
                    console.error(`❌ ${provider.name}: 测试失败 - ${error.message}`);
                }
            }

            console.groupEnd();

            const message = `API供应商测试完成: ${successCount}/${totalCount} 通过`;
            const type = successCount === totalCount ? 'success' : (successCount > 0 ? 'warning' : 'error');
            this.updateStatus(message, type);

        } catch (error) {
            console.error('Failed to test providers:', error);
            this.updateStatus('❌ 供应商测试失败', 'error');
        }
    }

    /**
     * 测试所有模型的API连接
     */
    async testAllModelsAPI() {
        try {
            this.updateStatus('正在测试所有模型API连接...', 'loading');

            const models = await this.configManager.getModels();
            if (models.length === 0) {
                this.updateStatus('❌ 没有配置的模型可供测试', 'error');
                return;
            }

            let successCount = 0;
            const totalCount = models.length;

            console.group('🧠 模型API测试结果');

            for (const model of models) {
                try {
                    console.log(`测试模型API: ${model.name} (${model.modelId})`);
                    const testResult = await this.modelConfig.performModelAPITest(model,
                        this.providerConfig.providers.find(p => p.id === model.providerId));

                    if (testResult.isValid) {
                        successCount++;
                        console.log(`✅ ${model.name}: API连接成功`);
                    } else {
                        console.error(`❌ ${model.name}: ${testResult.error}`);
                    }
                } catch (error) {
                    console.error(`❌ ${model.name}: API测试失败 - ${error.message}`);
                }
            }

            console.groupEnd();

            const message = `模型API测试完成: ${successCount}/${totalCount} 通过`;
            const type = successCount === totalCount ? 'success' : (successCount > 0 ? 'warning' : 'error');
            this.updateStatus(message, type);

        } catch (error) {
            console.error('Failed to test models API:', error);
            this.updateStatus('❌ 模型API测试失败', 'error');
        }
    }

    /**
     * 测试TaskMaster集成
     */
    async testTaskMasterIntegration() {
        try {
            this.updateStatus('正在测试TaskMaster集成...', 'loading');

            // 运行完整的TaskMaster测试套件
            const testResults = await this.taskMasterTester.runFullTaskMasterTest();

            // 显示测试结果
            const { overall, tests } = testResults;

            if (overall.failed === 0) {
                this.updateStatus(`✅ TaskMaster集成测试全部通过！(${overall.passed}/${overall.total})`, 'success');
            } else {
                this.updateStatus(`❌ TaskMaster集成测试部分失败 (${overall.passed}/${overall.total} 通过)`, 'error');
            }

            // 在控制台显示详细结果
            console.group('⚙️ TaskMaster集成测试结果');
            console.log(`总体结果: ${overall.passed}/${overall.total} 通过`);

            tests.forEach(test => {
                if (test.passed) {
                    console.log(`✅ ${test.name}: ${test.details}`);
                } else {
                    console.error(`❌ ${test.name}: ${test.details}`);
                    if (test.errors.length > 0) {
                        console.error('错误详情:', test.errors);
                    }
                }
            });
            console.groupEnd();

            // 如果有失败的测试，显示建议
            if (overall.failed > 0) {
                const failedTests = tests.filter(t => !t.passed);
                const suggestions = this.generateTestFailureSuggestions(failedTests);
                console.log('💡 修复建议:', suggestions);
            }

        } catch (error) {
            console.error('TaskMaster integration test failed:', error);
            this.updateStatus(`❌ TaskMaster集成测试失败: ${error.message}`, 'error');
        }
    }

    async tryAutoLoadConfiguration() {
        try {
            // Only try auto-load if project path is valid
            if (!this.configManager.isProjectValid()) {
                console.log('No valid TaskMaster project path set, skipping auto-load');
                return;
            }

            console.log('Valid TaskMaster project detected, attempting auto-load...');
            this.updateStatus('检测到 TaskMaster 项目，正在尝试自动加载配置...', 'loading');

            // Try to auto-load configuration silently
            // We'll use a simplified approach that doesn't require user file selection
            await this.tryAutoImportConfiguration();

        } catch (error) {
            // Auto-load failure is not critical, just log it
            console.log('Auto-load configuration failed (this is normal):', error.message);
            // Don't show error to user for auto-load failures
        }
    }

    async tryAutoImportConfiguration() {
        try {
            const projectPath = this.configManager.getProjectPath();

            // 首先检查是否有现有配置
            let providers = await this.configManager.getProviders();
            let models = await this.configManager.getModels();

            // 如果没有配置或只有默认的空配置，尝试自动加载
            const hasEmptyConfig = providers.length <= 3 && providers.every(p => !p.apiKey);

            if (hasEmptyConfig && models.length === 0) {
                console.log('检测到空配置，尝试自动加载现有TaskMaster配置...');

                // 尝试自动加载现有配置
                const autoLoaded = await this.saveConfig.tryAutoLoadExistingConfig();

                if (autoLoaded) {
                    // 重新加载数据
                    await this.loadInitialData();
                    providers = await this.configManager.getProviders();
                    models = await this.configManager.getModels();

                    this.updateStatus(`🎉 自动加载成功！已加载 ${providers.length} 个服务商和 ${models.length} 个模型`, 'success');
                } else {
                    this.updateStatus(`📁 检测到 TaskMaster 项目: ${projectPath}。点击"导入配置"按钮加载现有配置。`, 'info');
                }
            } else {
                // 已有配置
                this.updateStatus(`✅ 配置已加载 (${providers.length} 个服务商, ${models.length} 个模型)`, 'success');
            }
        } catch (error) {
            throw error;
        }
    }



    /**
     * 生成测试失败的修复建议
     */
    generateTestFailureSuggestions(failedTests) {
        const suggestions = [];

        failedTests.forEach(test => {
            switch (test.name) {
                case '配置转换测试':
                    suggestions.push('检查服务商和模型配置是否完整');
                    break;
                case '模型选择测试':
                    suggestions.push('确保模型配置了正确的角色（main/fallback/research）');
                    break;
                case '任务创建测试':
                    suggestions.push('确保至少有一个服务商配置了有效的API密钥');
                    break;
                case '配置验证测试':
                    suggestions.push('检查配置格式是否符合TaskMaster要求');
                    break;
                case '端到端流程测试':
                    suggestions.push('检查配置转换过程中是否有数据丢失');
                    break;
            }
        });

        return suggestions;
    }



    async autoLoadConfiguration() {
        try {
            // 首先检查项目路径是否已设置
            if (!this.configManager.isProjectValid()) {
                this.updateStatus('❌ 请先设置有效的TaskMaster项目路径', 'error');
                return;
            }

            this.updateStatus('正在自动加载TaskMaster配置...', 'loading');

            // 首先清除现有的默认配置
            await this.configManager.resetConfiguration();

            // 尝试自动加载
            const success = await this.saveConfig.tryAutoLoadExistingConfig();

            if (success) {
                // 重新加载界面数据
                await this.loadInitialData();

                const providers = await this.configManager.getProviders();
                const models = await this.configManager.getModels();

                this.updateStatus(`🎉 自动加载成功！已加载 ${providers.length} 个服务商和 ${models.length} 个模型`, 'success');
            } else {
                this.updateStatus('❌ 自动加载失败，请手动导入配置', 'error');
            }
        } catch (error) {
            console.error('Auto load configuration failed:', error);
            this.updateStatus('❌ 自动加载配置失败', 'error');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TaskMasterConfigApp();
});
