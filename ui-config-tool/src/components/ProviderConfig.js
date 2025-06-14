/**
 * ProviderConfig.js
 * Component for managing API provider configurations
 */

import { ProviderValidator } from '../utils/ProviderValidator.js';

export class ProviderConfig {
    constructor(configManager) {
        this.configManager = configManager;
        this.providers = [];
        this.validator = new ProviderValidator();
    }

    initialize() {
        this.bindEvents();
    }

    bindEvents() {
        // Event delegation for provider actions
        document.getElementById('providers-list').addEventListener('click', (e) => {
            if (e.target.matches('.edit-provider-btn')) {
                const providerId = e.target.dataset.providerId;
                this.editProvider(providerId);
            } else if (e.target.matches('.delete-provider-btn')) {
                const providerId = e.target.dataset.providerId;
                this.deleteProvider(providerId);
            } else if (e.target.matches('.test-provider-btn')) {
                const providerId = e.target.dataset.providerId;
                this.testProvider(providerId);
            } else if (e.target.matches('.load-models-btn')) {
                const providerId = e.target.dataset.providerId;
                this.loadProviderModels(providerId);
            }
        });
    }

    async loadProviders() {
        try {
            this.providers = await this.configManager.getProviders();
            this.renderProviders();
        } catch (error) {
            console.error('Failed to load providers:', error);
        }
    }

    renderProviders() {
        const container = document.getElementById('providers-list');
        
        if (this.providers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔌</div>
                    <h3>未配置服务商</h3>
                    <p>添加您的第一个 API 服务商以开始使用</p>
                    <button class="btn btn-primary" onclick="document.getElementById('add-provider-btn').click()">
                        <span class="btn-icon">➕</span>
                        添加服务商
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.providers.map(provider => this.renderProviderCard(provider)).join('');
    }

    renderProviderCard(provider) {
        const statusClass = provider.isValid ? 'status-success' : 'status-error';
        const statusIcon = provider.isValid ? '✅' : '❌';
        const statusText = provider.isValid ? '已连接' : '配置错误';

        return `
            <div class="card provider-card" data-provider-id="${provider.id}">
                <div class="provider-header">
                    <div class="provider-info">
                        <h3 class="provider-name">${provider.name}</h3>
                        <div class="provider-status ${statusClass}">
                            <span class="status-icon">${statusIcon}</span>
                            <span class="status-text">${statusText}</span>
                        </div>
                    </div>
                    <div class="provider-actions">
                        <button class="btn btn-sm btn-secondary test-provider-btn" data-provider-id="${provider.id}">
                            <span class="btn-icon">🔍</span>
                            测试连接
                        </button>
                        <button class="btn btn-sm btn-success load-models-btn" data-provider-id="${provider.id}">
                            <span class="btn-icon">📥</span>
                            加载模型
                        </button>
                        <button class="btn btn-sm btn-primary edit-provider-btn" data-provider-id="${provider.id}">
                            <span class="btn-icon">✏️</span>
                            编辑
                        </button>
                        <button class="btn btn-sm btn-danger delete-provider-btn" data-provider-id="${provider.id}">
                            <span class="btn-icon">🗑️</span>
                            删除
                        </button>
                    </div>
                </div>
                <div class="provider-details">
                    <div class="detail-item">
                        <label>端点地址:</label>
                        <span class="detail-value">${provider.endpoint || '未配置'}</span>
                    </div>
                    <div class="detail-item">
                        <label>API 密钥:</label>
                        <span class="detail-value">${provider.apiKey ? '••••••••' : '未配置'}</span>
                    </div>
                    <div class="detail-item">
                        <label>模型数量:</label>
                        <span class="detail-value">${provider.models?.length || 0} 个已配置</span>
                    </div>
                </div>
            </div>
        `;
    }

    showAddProviderModal() {
        this.showProviderModal();
    }

    editProvider(providerId) {
        const provider = this.providers.find(p => p.id === providerId);
        if (provider) {
            this.showProviderModal(provider);
        }
    }

    showProviderModal(provider = null) {
        const isEdit = !!provider;
        const modalTitle = isEdit ? '编辑服务商' : '添加新服务商';
        
        const modalHtml = `
            <div class="modal">
                <div class="modal-header">
                    <h2>${modalTitle}</h2>
                    <button class="modal-close-btn" onclick="this.closest('.modal-overlay').classList.add('hidden')">×</button>
                </div>
                <form class="modal-body" id="provider-form">
                    <div class="form-group">
                        <label for="provider-name">服务商名称</label>
                        <input type="text" id="provider-name" name="name" required
                               value="${provider?.name || ''}"
                               placeholder="例如：FoApi、自定义 OpenAI">
                    </div>

                    <div class="form-group">
                        <label for="provider-endpoint">API 端点</label>
                        <input type="url" id="provider-endpoint" name="endpoint" required
                               value="${provider?.endpoint || ''}"
                               placeholder="https://api.example.com">
                        <small class="form-help">API 的基础 URL（不包含 /v1 后缀）</small>
                        <div id="endpoint-validation" class="validation-message"></div>
                        <div id="provider-suggestions" class="provider-suggestions"></div>
                    </div>

                    <div class="form-group">
                        <label for="provider-api-key">API 密钥</label>
                        <input type="password" id="provider-api-key" name="apiKey"
                               value="${provider?.apiKey || ''}"
                               placeholder="输入您的 API 密钥">
                        <small class="form-help">您的 API 密钥将被安全存储</small>
                        <div id="apikey-validation" class="validation-message"></div>
                    </div>

                    <div class="form-group">
                        <label for="provider-type">服务商类型</label>
                        <select id="provider-type" name="type" required>
                            <option value="openai" ${provider?.type === 'openai' ? 'selected' : ''}>OpenAI 兼容</option>
                            <option value="anthropic" ${provider?.type === 'anthropic' ? 'selected' : ''}>Anthropic</option>
                            <option value="google" ${provider?.type === 'google' ? 'selected' : ''}>Google</option>
                            <option value="custom" ${provider?.type === 'custom' ? 'selected' : ''}>自定义</option>
                        </select>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').classList.add('hidden')">
                            取消
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <span class="btn-icon">${isEdit ? '💾' : '➕'}</span>
                            ${isEdit ? '更新' : '添加'}服务商
                        </button>
                    </div>
                </form>
            </div>
        `;

        this.showModal(modalHtml);
        
        // Bind form submission
        document.getElementById('provider-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProviderSubmit(e.target, provider);
        });

        // Bind real-time validation
        this.bindFormValidation();
    }

    async handleProviderSubmit(form, existingProvider) {
        const formData = new FormData(form);
        const providerData = {
            id: existingProvider?.id || this.generateId(),
            name: formData.get('name').trim(),
            endpoint: formData.get('endpoint').trim(),
            apiKey: formData.get('apiKey').trim(),
            type: formData.get('type'),
            isValid: false // Will be validated later
        };

        try {
            // Validate provider configuration
            const validation = this.validator.validateProvider(providerData);
            if (!validation.isValid) {
                this.showValidationErrors(validation.errors);
                return;
            }

            // Check for duplicate names (excluding current provider)
            const existingProviders = await this.configManager.getProviders();
            const duplicateName = existingProviders.find(p =>
                p.name.toLowerCase() === providerData.name.toLowerCase() &&
                p.id !== providerData.id
            );

            if (duplicateName) {
                this.showValidationErrors(['服务商名称已存在']);
                return;
            }

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="btn-icon">⏳</span>保存中...';
            submitBtn.disabled = true;

            try {
                if (existingProvider) {
                    await this.configManager.updateProvider(providerData);
                } else {
                    await this.configManager.addProvider(providerData);
                }

                // Test the provider connection
                const testResult = await this.validator.testProviderConnection(providerData);
                providerData.isValid = testResult.isValid;

                // Update provider with test result
                await this.configManager.updateProvider(providerData);

                await this.loadProviders();
                this.hideModal();

                // Show success message
                const message = testResult.isValid ?
                    '服务商保存并测试成功！' :
                    '服务商已保存但连接测试失败';
                const type = testResult.isValid ? 'success' : 'warning';

                if (window.app && window.app.updateStatus) {
                    window.app.updateStatus(message, type);
                }

                // Dispatch change event
                document.dispatchEvent(new CustomEvent('configChanged'));

            } finally {
                // Restore button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }

        } catch (error) {
            console.error('Failed to save provider:', error);
            this.showValidationErrors([`保存服务商失败: ${error.message}`]);
        }
    }

    async deleteProvider(providerId) {
        if (!confirm('确定要删除此服务商吗？此操作无法撤销。')) {
            return;
        }

        try {
            await this.configManager.deleteProvider(providerId);
            await this.loadProviders();
            
            // Dispatch change event
            document.dispatchEvent(new CustomEvent('configChanged'));
        } catch (error) {
            console.error('Failed to delete provider:', error);
            alert('删除服务商失败');
        }
    }

    async testProvider(providerId) {
        const provider = this.providers.find(p => p.id === providerId);
        if (!provider) return;

        try {
            // Show testing state
            const testBtn = document.querySelector(`[data-provider-id="${providerId}"].test-provider-btn`);
            if (testBtn) {
                testBtn.innerHTML = '<span class="btn-icon">⏳</span>测试中...';
                testBtn.disabled = true;
            }

            // Use the enhanced validator for testing
            const testResult = await this.validator.testProviderConnection(provider);
            provider.isValid = testResult.isValid;

            // Update provider in storage
            await this.configManager.updateProvider(provider);

            // Update the UI
            this.renderProviders();

            // Show detailed status message
            let message = testResult.message || (testResult.isValid ? '服务商连接成功！' : '服务商连接失败');
            if (!testResult.isValid && testResult.errors.length > 0) {
                message += ': ' + testResult.errors.join(', ');
            }

            const type = testResult.isValid ? 'success' : 'error';

            // Show status message
            if (window.app && window.app.updateStatus) {
                window.app.updateStatus(message, type);
            }

        } catch (error) {
            console.error('Failed to test provider:', error);
            provider.isValid = false;
            await this.configManager.updateProvider(provider);
            this.renderProviders();

            if (window.app && window.app.updateStatus) {
                window.app.updateStatus(`服务商测试失败: ${error.message}`, 'error');
            }
        }
    }

    /**
     * 加载指定服务商的模型并导航到模型页面
     */
    async loadProviderModels(providerId) {
        const provider = this.providers.find(p => p.id === providerId);
        if (!provider) return;

        try {
            // 显示加载状态
            const loadBtn = document.querySelector(`[data-provider-id="${providerId}"].load-models-btn`);
            if (loadBtn) {
                loadBtn.innerHTML = '<span class="btn-icon">⏳</span>加载中...';
                loadBtn.disabled = true;
            }

            // 获取支持的模型列表
            console.log(`正在为服务商 ${provider.name} (类型: ${provider.type}) 获取支持的模型`);
            const supportedModels = await this.getSupportedModelsForProvider(provider);
            console.log(`找到 ${supportedModels.length} 个支持的模型:`, supportedModels.map(m => m.name));

            if (supportedModels.length === 0) {
                if (window.app && window.app.updateStatus) {
                    window.app.updateStatus(`❌ 未找到${provider.name}支持的模型`, 'error');
                }
                return;
            }

            // 为每个模型创建配置并添加到系统中
            let addedCount = 0;
            for (const modelInfo of supportedModels) {
                const modelData = {
                    id: this.generateModelId(),
                    name: modelInfo.name || modelInfo.id,
                    modelId: modelInfo.id,
                    providerId: provider.id,
                    providerName: provider.name,
                    allowedRoles: ['main', 'fallback'], // 默认角色
                    maxTokens: modelInfo.maxTokens || 4096,
                    costPer1MTokens: {
                        input: modelInfo.cost || 0,
                        output: modelInfo.cost || 0
                    },
                    sweScore: (modelInfo.swe_score * 100) || 0, // 转换为百分比
                    isActive: true
                };

                // 检查是否已存在相同的模型
                const existingModels = await this.configManager.getModels();
                const exists = existingModels.find(m =>
                    m.modelId === modelData.modelId && m.providerId === modelData.providerId
                );

                if (!exists) {
                    await this.configManager.addModel(modelData);
                    addedCount++;
                }
            }

            // 导航到模型页面并过滤显示该服务商的模型
            this.navigateToModelsPage(provider);

            // 显示结果
            const message = addedCount > 0 ?
                `✅ 成功加载 ${addedCount} 个${provider.name}模型` :
                `ℹ️ ${provider.name}的所有模型都已存在`;

            if (window.app && window.app.updateStatus) {
                window.app.updateStatus(message, addedCount > 0 ? 'success' : 'info');
            }

            // 触发配置变更事件
            document.dispatchEvent(new CustomEvent('configChanged'));

        } catch (error) {
            console.error('Failed to load provider models:', error);
            if (window.app && window.app.updateStatus) {
                window.app.updateStatus(`❌ 加载${provider.name}模型失败: ${error.message}`, 'error');
            }
        } finally {
            // 恢复按钮状态
            const loadBtn = document.querySelector(`[data-provider-id="${providerId}"].load-models-btn`);
            if (loadBtn) {
                loadBtn.innerHTML = '<span class="btn-icon">📥</span>加载模型';
                loadBtn.disabled = false;
            }
        }
    }

    /**
     * 导航到模型页面并过滤显示该服务商的模型
     */
    navigateToModelsPage(provider) {
        console.log(`导航到模型页面，过滤显示${provider.name}的模型`);

        // 切换到模型标签页
        const modelsTab = document.querySelector('[data-tab="models"]');
        console.log(`查找模型标签页:`, modelsTab);
        if (modelsTab) {
            console.log(`点击模型标签页`);
            modelsTab.click();
        } else {
            console.error('未找到模型标签页元素');
        }

        // 设置过滤器并重新渲染
        setTimeout(() => {
            console.log(`检查window.app:`, window.app);
            console.log(`检查window.app.modelConfig:`, window.app?.modelConfig);

            if (window.app && window.app.modelConfig) {
                console.log(`开始重新加载模型数据`);
                // 重新加载模型数据
                window.app.modelConfig.loadModels().then(() => {
                    console.log(`模型数据加载完成，准备过滤`);
                    // 延迟一点确保模型数据已经渲染
                    setTimeout(() => {
                        console.log(`准备过滤服务商: ${provider.name} (ID: ${provider.id})`);
                        // 设置过滤器显示该服务商的模型
                        window.app.modelConfig.filterByProvider(provider.id);
                    }, 50);
                }).catch(error => {
                    console.error('加载模型数据失败:', error);
                });
            } else {
                console.error('window.app.modelConfig 不存在');
            }
        }, 200);
    }

    /**
     * 获取服务商支持的模型列表
     */
    async getSupportedModelsForProvider(provider) {
        // 根据服务商名称返回支持的模型（不使用类型，因为类型可能相同）
        const supportedModelsMap = {
            // 按服务商名称映射
            'OpenAI': [
                { id: 'gpt-4o', name: 'GPT-4o', swe_score: 0.332, maxTokens: 128000, cost: 0.005 },
                { id: 'gpt-4o-mini', name: 'GPT-4o Mini', swe_score: 0.3, maxTokens: 128000, cost: 0.0015 },
                { id: 'o1', name: 'o1', swe_score: 0.489, maxTokens: 200000, cost: 0.015 },
                { id: 'o1-mini', name: 'o1 Mini', swe_score: 0.4, maxTokens: 128000, cost: 0.003 }
            ],
            'Anthropic': [
                { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', swe_score: 0.49, maxTokens: 200000, cost: 0.003 },
                { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', swe_score: 0.623, maxTokens: 200000, cost: 0.003 }
            ],
            'FoApi': [
                { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1', swe_score: 0.7, maxTokens: 65536, cost: 0.0014 },
                { id: 'gpt-4.1-mini-2025-04-14', name: 'GPT-4.1 Mini', swe_score: 0.45, maxTokens: 128000, cost: 0.001 }
            ],
            'PoloAI': [
                { id: 'gemini-2.5-pro-preview-06-05', name: 'Gemini 2.5 Pro', swe_score: 0.638, maxTokens: 2000000, cost: 0.00125 },
                { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash', swe_score: 0.5, maxTokens: 1000000, cost: 0.000075 },
                { id: 'gemini-2.5-flash-preview-05-20-nothinking', name: 'Gemini 2.5 Flash (No Thinking)', swe_score: 0.48, maxTokens: 1000000, cost: 0.000075 }
            ],
            'Google': [
                { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', swe_score: 0.52, maxTokens: 1000000, cost: 0.000075 },
                { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', swe_score: 0.45, maxTokens: 2000000, cost: 0.00125 }
            ]
        };

        // 使用服务商名称而不是类型
        const providerName = provider.name;
        console.log(`查找服务商 "${providerName}" 的模型映射`);

        const models = supportedModelsMap[providerName] || [];
        console.log(`服务商 "${providerName}" 映射到 ${models.length} 个模型`);

        return models;
    }

    /**
     * 生成模型ID
     */
    generateModelId() {
        return 'model_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    showModal(html) {
        const overlay = document.getElementById('modal-overlay');
        overlay.innerHTML = html;
        overlay.classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    }

    generateId() {
        return 'provider_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Bind real-time form validation
     */
    bindFormValidation() {
        const endpointInput = document.getElementById('provider-endpoint');
        const apiKeyInput = document.getElementById('provider-api-key');
        const typeSelect = document.getElementById('provider-type');
        const nameInput = document.getElementById('provider-name');

        if (endpointInput) {
            endpointInput.addEventListener('input', () => this.validateEndpointField());
            endpointInput.addEventListener('blur', () => this.suggestProviderType());
        }

        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', () => this.validateApiKeyField());
        }

        if (nameInput) {
            nameInput.addEventListener('input', () => this.validateNameField());
        }

        if (typeSelect) {
            typeSelect.addEventListener('change', () => this.validateApiKeyField());
        }
    }

    /**
     * Validate endpoint field in real-time
     */
    validateEndpointField() {
        const endpointInput = document.getElementById('provider-endpoint');
        const validationDiv = document.getElementById('endpoint-validation');

        if (!endpointInput || !validationDiv) return;

        const endpoint = endpointInput.value.trim();
        if (!endpoint) {
            validationDiv.innerHTML = '';
            return;
        }

        const validation = this.validator.validateEndpoint(endpoint);
        if (validation.isValid) {
            validationDiv.innerHTML = '<span class="validation-success">✅ 端点格式有效</span>';
        } else {
            validationDiv.innerHTML = `<span class="validation-error">❌ ${validation.errors.join(', ')}</span>`;
        }
    }

    /**
     * Validate API key field in real-time
     */
    validateApiKeyField() {
        const apiKeyInput = document.getElementById('provider-api-key');
        const typeSelect = document.getElementById('provider-type');
        const validationDiv = document.getElementById('apikey-validation');

        if (!apiKeyInput || !validationDiv || !typeSelect) return;

        const apiKey = apiKeyInput.value.trim();
        const providerType = typeSelect.value;

        if (!apiKey) {
            validationDiv.innerHTML = '';
            return;
        }

        const validation = this.validator.validateApiKey(apiKey, providerType);
        if (validation.isValid) {
            validationDiv.innerHTML = '<span class="validation-success">✅ API 密钥格式有效</span>';
        } else {
            validationDiv.innerHTML = `<span class="validation-error">❌ ${validation.errors.join(', ')}</span>`;
        }
    }

    /**
     * Validate name field in real-time
     */
    validateNameField() {
        const nameInput = document.getElementById('provider-name');

        if (!nameInput) return;

        const name = nameInput.value.trim();
        if (!name) return;

        // Basic name validation
        if (name.length < 2) {
            nameInput.setCustomValidity('服务商名称至少需要2个字符');
        } else if (name.length > 50) {
            nameInput.setCustomValidity('服务商名称不能超过50个字符');
        } else if (!/^[a-zA-Z0-9\s\-_\.]+$/.test(name)) {
            nameInput.setCustomValidity('服务商名称包含无效字符');
        } else {
            nameInput.setCustomValidity('');
        }
    }

    /**
     * Suggest provider type based on endpoint
     */
    suggestProviderType() {
        const endpointInput = document.getElementById('provider-endpoint');
        const suggestionsDiv = document.getElementById('provider-suggestions');
        const typeSelect = document.getElementById('provider-type');

        if (!endpointInput || !suggestionsDiv) return;

        const endpoint = endpointInput.value.trim();
        if (!endpoint) {
            suggestionsDiv.innerHTML = '';
            return;
        }

        try {
            const suggestions = this.validator.suggestProviderType(endpoint);
            if (suggestions.length > 0) {
                const topSuggestion = suggestions[0];
                suggestionsDiv.innerHTML = `
                    <div class="provider-suggestion">
                        <span class="suggestion-text">💡 检测到: ${topSuggestion.type} 服务商</span>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="this.parentElement.parentElement.parentElement.querySelector('#provider-type').value='${topSuggestion.type}'">
                            应用
                        </button>
                    </div>
                `;
            } else {
                suggestionsDiv.innerHTML = '';
            }
        } catch (error) {
            suggestionsDiv.innerHTML = '';
        }
    }

    /**
     * Show validation errors in the modal
     */
    showValidationErrors(errors) {
        // Remove existing error display
        const existingError = document.querySelector('.validation-errors');
        if (existingError) {
            existingError.remove();
        }

        // Create error display
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-errors';
        errorDiv.innerHTML = `
            <div class="alert alert-error">
                <strong>验证错误:</strong>
                <ul>
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            </div>
        `;

        // Insert before form actions
        const modalActions = document.querySelector('.modal-actions');
        if (modalActions) {
            modalActions.parentNode.insertBefore(errorDiv, modalActions);
        }
    }
}
