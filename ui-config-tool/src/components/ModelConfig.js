/**
 * ModelConfig.js
 * Component for managing AI model configurations
 */

export class ModelConfig {
    constructor(configManager) {
        this.configManager = configManager;
        this.models = [];
        this.providers = [];
        this.currentProviderFilter = null; // 当前过滤的服务商ID
    }

    initialize() {
        this.bindEvents();
    }

    bindEvents() {
        // Event delegation for model actions
        document.getElementById('models-list').addEventListener('click', (e) => {
            if (e.target.matches('.edit-model-btn')) {
                const modelId = e.target.dataset.modelId;
                this.editModel(modelId);
            } else if (e.target.matches('.delete-model-btn')) {
                const modelId = e.target.dataset.modelId;
                this.deleteModel(modelId);
            } else if (e.target.matches('.test-model-api-btn')) {
                const modelId = e.target.dataset.modelId;
                this.testModelAPI(modelId);
            } else if (e.target.matches('.test-model-taskmaster-btn')) {
                const modelId = e.target.dataset.modelId;
                this.testModelTaskMaster(modelId);
            }
        });
    }

    async loadModels() {
        try {
            this.models = await this.configManager.getModels();
            this.providers = await this.configManager.getProviders();
            this.renderModels();
        } catch (error) {
            console.error('Failed to load models:', error);
        }
    }

    renderModels() {
        const container = document.getElementById('models-list');

        if (this.models.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🧠</div>
                    <h3>未配置模型</h3>
                    <p>添加您的第一个 AI 模型开始使用</p>
                    <button class="btn btn-primary" onclick="document.getElementById('add-model-btn').click()">
                        <span class="btn-icon">➕</span>
                        添加模型
                    </button>
                </div>
            `;
            return;
        }

        // 获取要显示的模型
        const modelsToShow = this.getModelsToShow();

        if (modelsToShow.length === 0 && this.currentProviderFilter) {
            // 如果有过滤器但没有匹配的模型
            const provider = this.providers.find(p => p.id === this.currentProviderFilter);
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🧠</div>
                    <h3>暂无${provider?.name || '该服务商'}的模型</h3>
                    <p>该服务商还没有配置任何模型</p>
                    <button class="btn btn-secondary" onclick="window.app.modelConfig.clearFilter()">
                        <span class="btn-icon">🔄</span>
                        显示所有模型
                    </button>
                </div>
            `;
            return;
        }

        // 显示过滤信息（如果有过滤）
        let filterInfo = '';
        if (this.currentProviderFilter) {
            const provider = this.providers.find(p => p.id === this.currentProviderFilter);
            filterInfo = `
                <div class="filter-info-bar">
                    <span class="filter-text">正在显示: ${provider?.name || '未知服务商'} 的模型 (${modelsToShow.length} 个)</span>
                    <button class="btn btn-sm btn-secondary" onclick="window.app.modelConfig.clearFilter()">
                        <span class="btn-icon">✖️</span>
                        显示所有模型
                    </button>
                </div>
            `;
        }

        // 渲染模型卡片
        const modelsHtml = modelsToShow.map(model => this.renderModelCard(model)).join('');
        container.innerHTML = filterInfo + modelsHtml;
    }

    /**
     * 获取要显示的模型
     */
    getModelsToShow() {
        if (!this.currentProviderFilter) {
            return this.models;
        }
        return this.models.filter(model => model.providerId === this.currentProviderFilter);
    }

    /**
     * 按服务商过滤模型
     */
    filterByProvider(providerId) {
        console.log(`过滤显示服务商: ${providerId}`);
        console.log(`当前所有模型:`, this.models.map(m => `${m.name} (${m.providerId})`));

        this.currentProviderFilter = providerId || null;

        const filteredModels = this.getModelsToShow();
        console.log(`过滤后的模型:`, filteredModels.map(m => `${m.name} (${m.providerId})`));

        this.renderModels();
    }

    /**
     * 清除过滤器
     */
    clearFilter() {
        console.log('清除过滤器，显示所有模型');
        this.currentProviderFilter = null;
        this.renderModels();
    }



    renderModelCard(model) {
        const provider = this.providers.find(p => p.id === model.providerId);
        const providerName = provider ? provider.name : '未知服务商';
        
        const rolesBadges = model.allowedRoles?.map(role => 
            `<span class="role-badge role-${role}">${role}</span>`
        ).join('') || '';

        const scoreStars = this.getScoreStars(model.sweScore);

        return `
            <div class="card model-card" data-model-id="${model.id}">
                <div class="model-header">
                    <div class="model-info">
                        <h3 class="model-name">${model.name}</h3>
                        <div class="model-provider">${providerName}</div>
                        <div class="model-score">
                            <span class="score-value">${model.sweScore || 'N/A'}%</span>
                            <span class="score-stars">${scoreStars}</span>
                        </div>
                    </div>
                    <div class="model-actions">
                        <button class="btn btn-sm btn-secondary test-model-api-btn" data-model-id="${model.id}">
                            <span class="btn-icon">🔌</span>
                            测试API
                        </button>
                        <button class="btn btn-sm btn-warning test-model-taskmaster-btn" data-model-id="${model.id}">
                            <span class="btn-icon">⚙️</span>
                            测试TaskMaster
                        </button>
                        <button class="btn btn-sm btn-primary edit-model-btn" data-model-id="${model.id}">
                            <span class="btn-icon">✏️</span>
                            编辑
                        </button>
                        <button class="btn btn-sm btn-danger delete-model-btn" data-model-id="${model.id}">
                            <span class="btn-icon">🗑️</span>
                            删除
                        </button>
                    </div>
                </div>
                <div class="model-details">
                    <div class="detail-item">
                        <label>模型 ID:</label>
                        <span class="detail-value model-id">${model.modelId}</span>
                    </div>
                    <div class="detail-item">
                        <label>最大令牌数:</label>
                        <span class="detail-value">${model.maxTokens?.toLocaleString() || '未设置'}</span>
                    </div>
                    <div class="detail-item">
                        <label>成本 (每百万令牌):</label>
                        <span class="detail-value">
                            $${model.costPer1MTokens?.input || '未设置'} 输入,
                            $${model.costPer1MTokens?.output || '未设置'} 输出
                        </span>
                    </div>
                    <div class="detail-item">
                        <label>允许角色:</label>
                        <div class="detail-value roles-container">
                            ${rolesBadges}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getScoreStars(score) {
        if (!score) return '☆☆☆';
        
        if (score >= 70) return '★★★';
        if (score >= 50) return '★★☆';
        if (score >= 30) return '★☆☆';
        return '☆☆☆';
    }

    showAddModelModal() {
        this.showModelModal();
    }

    editModel(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (model) {
            this.showModelModal(model);
        }
    }

    showModelModal(model = null) {
        const isEdit = !!model;
        const modalTitle = isEdit ? '编辑模型' : '添加新模型';
        
        const providerOptions = this.providers.map(provider => 
            `<option value="${provider.id}" ${model?.providerId === provider.id ? 'selected' : ''}>
                ${provider.name}
            </option>`
        ).join('');

        const modalHtml = `
            <div class="modal">
                <div class="modal-header">
                    <h2>${modalTitle}</h2>
                    <button class="modal-close-btn" onclick="this.closest('.modal-overlay').classList.add('hidden')">×</button>
                </div>
                <form class="modal-body" id="model-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="model-name">模型名称</label>
                            <input type="text" id="model-name" name="name" required
                                   value="${model?.name || ''}"
                                   placeholder="例如：DeepSeek R1">
                        </div>

                        <div class="form-group">
                            <label for="model-provider">服务商</label>
                            <select id="model-provider" name="providerId" required>
                                <option value="">选择服务商</option>
                                ${providerOptions}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="model-id">模型 ID</label>
                        <select id="model-id" name="modelId" required>
                            <option value="">选择模型</option>
                        </select>
                        <small class="form-help">从服务商支持的模型中选择</small>
                        <div id="model-suggestions" class="model-suggestions"></div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="model-swe-score">SWE 评分 (%)</label>
                            <input type="number" id="model-swe-score" name="sweScore"
                                   min="0" max="100" step="0.1"
                                   value="${model?.sweScore || ''}"
                                   placeholder="70.0">
                        </div>

                        <div class="form-group">
                            <label for="model-max-tokens">最大令牌数</label>
                            <input type="number" id="model-max-tokens" name="maxTokens"
                                   min="1000" step="1000"
                                   value="${model?.maxTokens || ''}"
                                   placeholder="200000">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="model-cost-input">输入成本 (每百万令牌)</label>
                            <input type="number" id="model-cost-input" name="costInput"
                                   min="0" step="0.01"
                                   value="${model?.costPer1MTokens?.input || ''}"
                                   placeholder="0.14">
                        </div>

                        <div class="form-group">
                            <label for="model-cost-output">输出成本 (每百万令牌)</label>
                            <input type="number" id="model-cost-output" name="costOutput"
                                   min="0" step="0.01"
                                   value="${model?.costPer1MTokens?.output || ''}"
                                   placeholder="0.28">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>允许角色</label>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="allowedRoles" value="main"
                                       ${model?.allowedRoles?.includes('main') ? 'checked' : ''}>
                                <span class="checkbox-text">主要</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="allowedRoles" value="fallback"
                                       ${model?.allowedRoles?.includes('fallback') ? 'checked' : ''}>
                                <span class="checkbox-text">备用</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="allowedRoles" value="research"
                                       ${model?.allowedRoles?.includes('research') ? 'checked' : ''}>
                                <span class="checkbox-text">研究</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').classList.add('hidden')">
                            取消
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <span class="btn-icon">${isEdit ? '💾' : '➕'}</span>
                            ${isEdit ? '更新' : '添加'}模型
                        </button>
                    </div>
                </form>
            </div>
        `;

        this.showModal(modalHtml);

        // Bind form submission
        document.getElementById('model-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleModelSubmit(e.target, model);
        });

        // Bind provider change event to load models
        document.getElementById('model-provider').addEventListener('change', (e) => {
            this.loadProviderModels(e.target.value);
        });

        // Load models for initially selected provider
        if (model?.providerId) {
            this.loadProviderModels(model.providerId, model.modelId);
        }
    }

    async handleModelSubmit(form, existingModel) {
        const formData = new FormData(form);
        const allowedRoles = Array.from(form.querySelectorAll('input[name="allowedRoles"]:checked'))
            .map(input => input.value);

        const modelData = {
            id: existingModel?.id || this.generateId(),
            name: formData.get('name'),
            providerId: formData.get('providerId'),
            modelId: formData.get('modelId'),
            sweScore: parseFloat(formData.get('sweScore')) || null,
            maxTokens: parseInt(formData.get('maxTokens')) || null,
            costPer1MTokens: {
                input: parseFloat(formData.get('costInput')) || null,
                output: parseFloat(formData.get('costOutput')) || null
            },
            allowedRoles: allowedRoles
        };

        try {
            if (existingModel) {
                await this.configManager.updateModel(modelData);
            } else {
                await this.configManager.addModel(modelData);
            }

            await this.loadModels();
            this.hideModal();
            
            // Dispatch change event
            document.dispatchEvent(new CustomEvent('configChanged'));
        } catch (error) {
            console.error('Failed to save model:', error);
            alert('保存模型配置失败');
        }
    }

    async deleteModel(modelId) {
        if (!confirm('确定要删除此模型吗？此操作无法撤销。')) {
            return;
        }

        try {
            await this.configManager.deleteModel(modelId);
            await this.loadModels();
            
            // Dispatch change event
            document.dispatchEvent(new CustomEvent('configChanged'));
        } catch (error) {
            console.error('Failed to delete model:', error);
            alert('删除模型失败');
        }
    }

    /**
     * 测试模型API连接
     */
    async testModelAPI(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (!model) return;

        const provider = this.providers.find(p => p.id === model.providerId);
        if (!provider) {
            if (window.app && window.app.updateStatus) {
                window.app.updateStatus('❌ 未找到对应的服务商', 'error');
            }
            return;
        }

        try {
            // 显示测试状态
            const testBtn = document.querySelector(`[data-model-id="${modelId}"].test-model-api-btn`);
            if (testBtn) {
                testBtn.innerHTML = '<span class="btn-icon">⏳</span>测试中...';
                testBtn.disabled = true;
            }

            // 创建测试请求
            const testResult = await this.performModelAPITest(model, provider);

            // 显示结果
            const message = testResult.isValid ?
                `✅ ${model.name} API连接成功` :
                `❌ ${model.name} API连接失败: ${testResult.error}`;
            const type = testResult.isValid ? 'success' : 'error';

            if (window.app && window.app.updateStatus) {
                window.app.updateStatus(message, type);
            }

        } catch (error) {
            console.error('Failed to test model API:', error);
            if (window.app && window.app.updateStatus) {
                window.app.updateStatus(`❌ ${model.name} API测试失败: ${error.message}`, 'error');
            }
        } finally {
            // 恢复按钮状态
            const testBtn = document.querySelector(`[data-model-id="${modelId}"].test-model-api-btn`);
            if (testBtn) {
                testBtn.innerHTML = '<span class="btn-icon">🔌</span>测试API';
                testBtn.disabled = false;
            }
        }
    }

    /**
     * 测试模型在TaskMaster中的集成
     */
    async testModelTaskMaster(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (!model) return;

        try {
            // 显示测试状态
            const testBtn = document.querySelector(`[data-model-id="${modelId}"].test-model-taskmaster-btn`);
            if (testBtn) {
                testBtn.innerHTML = '<span class="btn-icon">⏳</span>测试中...';
                testBtn.disabled = true;
            }

            // 执行TaskMaster集成测试
            const testResult = await this.performTaskMasterIntegrationTest(model);

            // 显示结果
            const message = testResult.isValid ?
                `✅ ${model.name} TaskMaster集成正常` :
                `❌ ${model.name} TaskMaster集成失败: ${testResult.error}`;
            const type = testResult.isValid ? 'success' : 'error';

            if (window.app && window.app.updateStatus) {
                window.app.updateStatus(message, type);
            }

        } catch (error) {
            console.error('Failed to test model TaskMaster integration:', error);
            if (window.app && window.app.updateStatus) {
                window.app.updateStatus(`❌ ${model.name} TaskMaster集成测试失败: ${error.message}`, 'error');
            }
        } finally {
            // 恢复按钮状态
            const testBtn = document.querySelector(`[data-model-id="${modelId}"].test-model-taskmaster-btn`);
            if (testBtn) {
                testBtn.innerHTML = '<span class="btn-icon">⚙️</span>测试TaskMaster';
                testBtn.disabled = false;
            }
        }
    }

    /**
     * 执行模型API测试
     */
    async performModelAPITest(model, provider) {
        try {
            // 构建测试请求
            const testPayload = this.buildTestPayload(model, provider);

            // 发送测试请求
            const response = await fetch(provider.endpoint + '/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${provider.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testPayload)
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    isValid: true,
                    response: data
                };
            } else {
                const errorText = await response.text();
                return {
                    isValid: false,
                    error: `HTTP ${response.status}: ${errorText}`
                };
            }
        } catch (error) {
            return {
                isValid: false,
                error: error.message
            };
        }
    }

    /**
     * 构建测试请求载荷
     */
    buildTestPayload(model, provider) {
        const basePayload = {
            model: model.modelId,
            messages: [
                {
                    role: 'user',
                    content: 'Hello! This is a test message. Please respond with "Test successful".'
                }
            ],
            max_tokens: 50,
            temperature: 0.1
        };

        // 根据服务商类型调整载荷
        switch (provider.type) {
            case 'anthropic':
                return {
                    model: model.modelId,
                    max_tokens: 50,
                    messages: basePayload.messages
                };
            case 'google':
            case 'polo':
                return {
                    model: model.modelId,
                    contents: [
                        {
                            parts: [
                                {
                                    text: basePayload.messages[0].content
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: 50,
                        temperature: 0.1
                    }
                };
            default:
                return basePayload;
        }
    }

    /**
     * 执行TaskMaster集成测试
     */
    async performTaskMasterIntegrationTest(model) {
        try {
            // 检查模型配置是否完整
            if (!model.allowedRoles || model.allowedRoles.length === 0) {
                return {
                    isValid: false,
                    error: '模型未配置允许的角色'
                };
            }

            // 检查是否有对应的服务商
            const provider = this.providers.find(p => p.id === model.providerId);
            if (!provider) {
                return {
                    isValid: false,
                    error: '未找到对应的服务商配置'
                };
            }

            if (!provider.apiKey) {
                return {
                    isValid: false,
                    error: '服务商未配置API密钥'
                };
            }

            // 模拟TaskMaster配置转换测试
            const taskMasterConfig = this.buildTaskMasterConfig(model, provider);

            // 验证配置格式
            if (!this.validateTaskMasterConfig(taskMasterConfig)) {
                return {
                    isValid: false,
                    error: 'TaskMaster配置格式验证失败'
                };
            }

            return {
                isValid: true,
                config: taskMasterConfig
            };

        } catch (error) {
            return {
                isValid: false,
                error: error.message
            };
        }
    }

    /**
     * 构建TaskMaster配置
     */
    buildTaskMasterConfig(model, provider) {
        return {
            supportedModels: {
                [model.modelId]: {
                    name: model.name,
                    provider: provider.name,
                    swe_score: model.sweScore / 100 || 0,
                    max_tokens: model.maxTokens || 4096,
                    cost_per_1m_tokens: {
                        input: model.costPer1MTokens?.input || 0,
                        output: model.costPer1MTokens?.output || 0
                    }
                }
            },
            config: {
                providers: {
                    [provider.name.toLowerCase()]: {
                        endpoint: provider.endpoint,
                        api_key: provider.apiKey,
                        type: provider.type
                    }
                },
                models: this.buildModelRoleConfig(model)
            }
        };
    }

    /**
     * 构建模型角色配置
     */
    buildModelRoleConfig(model) {
        const roleConfig = {};

        if (model.allowedRoles?.includes('main')) {
            roleConfig.main = model.modelId;
        }
        if (model.allowedRoles?.includes('fallback')) {
            roleConfig.fallback = model.modelId;
        }
        if (model.allowedRoles?.includes('research')) {
            roleConfig.research = model.modelId;
        }

        return roleConfig;
    }

    /**
     * 验证TaskMaster配置格式
     */
    validateTaskMasterConfig(config) {
        return !!(
            config &&
            config.supportedModels &&
            config.config &&
            config.config.providers &&
            config.config.models
        );
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
        return 'model_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 根据服务商加载可用模型列表
     */
    async loadProviderModels(providerId, selectedModelId = null) {
        const modelSelect = document.getElementById('model-id');
        const suggestionsDiv = document.getElementById('model-suggestions');

        if (!providerId) {
            modelSelect.innerHTML = '<option value="">选择模型</option>';
            suggestionsDiv.innerHTML = '';
            return;
        }

        try {
            // 获取服务商信息
            const provider = this.providers.find(p => p.id === providerId);
            if (!provider) {
                modelSelect.innerHTML = '<option value="">服务商未找到</option>';
                return;
            }

            // 根据服务商类型获取支持的模型
            const supportedModels = await this.getSupportedModelsForProvider(provider);

            // 更新模型选择框
            modelSelect.innerHTML = '<option value="">选择模型</option>';

            supportedModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = `${model.name || model.id} (SWE: ${(model.swe_score * 100).toFixed(1)}%)`;
                if (selectedModelId === model.id) {
                    option.selected = true;
                }
                modelSelect.appendChild(option);
            });

            // 显示模型建议信息
            if (supportedModels.length > 0) {
                suggestionsDiv.innerHTML = `
                    <div class="model-suggestion">
                        <span class="suggestion-text">💡 找到 ${supportedModels.length} 个${provider.name}支持的模型</span>
                    </div>
                `;
            } else {
                suggestionsDiv.innerHTML = `
                    <div class="model-suggestion warning">
                        <span class="suggestion-text">⚠️ 未找到${provider.name}支持的模型，您可以手动输入模型ID</span>
                    </div>
                `;

                // 如果没有预定义模型，改回输入框
                modelSelect.outerHTML = `
                    <input type="text" id="model-id" name="modelId" required
                           value="${selectedModelId || ''}"
                           placeholder="输入模型ID，例如：deepseek-ai/DeepSeek-R1">
                `;
            }

        } catch (error) {
            console.error('加载服务商模型失败:', error);
            suggestionsDiv.innerHTML = `
                <div class="model-suggestion error">
                    <span class="suggestion-text">❌ 加载模型列表失败: ${error.message}</span>
                </div>
            `;
        }
    }

    /**
     * 获取服务商支持的模型列表
     */
    async getSupportedModelsForProvider(provider) {
        // 这里应该从TaskMaster的supported-models.json中获取
        // 现在先返回一些示例数据
        const supportedModelsMap = {
            'openai': [
                { id: 'gpt-4o', name: 'GPT-4o', swe_score: 0.332 },
                { id: 'gpt-4o-mini', name: 'GPT-4o Mini', swe_score: 0.3 },
                { id: 'o1', name: 'o1', swe_score: 0.489 },
                { id: 'o1-mini', name: 'o1 Mini', swe_score: 0.4 }
            ],
            'anthropic': [
                { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', swe_score: 0.49 },
                { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', swe_score: 0.623 }
            ],
            'foapi': [
                { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1', swe_score: 0.7 },
                { id: 'gpt-4.1-mini-2025-04-14', name: 'GPT-4.1 Mini', swe_score: 0.45 }
            ],
            'polo': [
                { id: 'gemini-2.5-pro-preview-06-05', name: 'Gemini 2.5 Pro', swe_score: 0.638 },
                { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash', swe_score: 0.5 }
            ]
        };

        const providerType = provider.type || 'custom';
        return supportedModelsMap[providerType] || [];
    }
}
