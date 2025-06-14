/**
 * TaskMasterTester.js
 * 真实的TaskMaster功能测试工具
 */

export class TaskMasterTester {
    constructor(configManager, transformer) {
        this.configManager = configManager;
        this.transformer = transformer;
    }

    /**
     * 运行完整的TaskMaster功能测试
     */
    async runFullTaskMasterTest() {
        const results = {
            overall: { passed: 0, failed: 0, total: 0 },
            tests: []
        };

        const tests = [
            { name: '配置转换测试', method: 'testConfigTransformation' },
            { name: '模型选择测试', method: 'testModelSelection' },
            { name: '任务创建测试', method: 'testTaskCreation' },
            { name: '配置验证测试', method: 'testConfigValidation' },
            { name: '端到端流程测试', method: 'testEndToEndFlow' }
        ];

        for (const test of tests) {
            try {
                console.log(`🧪 运行测试: ${test.name}`);
                const result = await this[test.method]();
                
                results.tests.push({
                    name: test.name,
                    passed: result.passed,
                    details: result.details,
                    errors: result.errors || []
                });

                if (result.passed) {
                    results.overall.passed++;
                } else {
                    results.overall.failed++;
                }
                results.overall.total++;

            } catch (error) {
                console.error(`❌ 测试失败: ${test.name}`, error);
                results.tests.push({
                    name: test.name,
                    passed: false,
                    details: `测试执行失败: ${error.message}`,
                    errors: [error.message]
                });
                results.overall.failed++;
                results.overall.total++;
            }
        }

        return results;
    }

    /**
     * 测试配置转换功能
     */
    async testConfigTransformation() {
        try {
            const providers = await this.configManager.getProviders();
            const models = await this.configManager.getModels();

            if (providers.length === 0 || models.length === 0) {
                return {
                    passed: false,
                    details: '没有可用的服务商或模型进行测试',
                    errors: ['需要至少一个服务商和一个模型']
                };
            }

            // 测试 UI -> TaskMaster 转换
            const taskMasterConfig = this.transformer.uiToTaskMaster(providers, models);
            
            // 验证转换结果
            if (!taskMasterConfig.supportedModels || !taskMasterConfig.config) {
                return {
                    passed: false,
                    details: 'TaskMaster配置转换失败',
                    errors: ['转换后的配置结构不完整']
                };
            }

            // 测试 TaskMaster -> UI 转换
            const backToUI = this.transformer.taskMasterToUi(taskMasterConfig);
            
            // 验证往返转换
            if (backToUI.providers.length !== providers.length || 
                backToUI.models.length !== models.length) {
                return {
                    passed: false,
                    details: '往返转换数据丢失',
                    errors: [`原始: ${providers.length}个服务商, ${models.length}个模型`, 
                            `转换后: ${backToUI.providers.length}个服务商, ${backToUI.models.length}个模型`]
                };
            }

            return {
                passed: true,
                details: `✅ 配置转换成功 (${providers.length}个服务商, ${models.length}个模型)`
            };

        } catch (error) {
            return {
                passed: false,
                details: '配置转换测试失败',
                errors: [error.message]
            };
        }
    }

    /**
     * 测试模型选择逻辑
     */
    async testModelSelection() {
        try {
            const providers = await this.configManager.getProviders();
            const models = await this.configManager.getModels();

            if (models.length === 0) {
                return {
                    passed: false,
                    details: '没有可用的模型进行测试',
                    errors: ['需要至少一个模型']
                };
            }

            // 测试按角色选择模型
            const mainModels = this.configManager.getModelsByRole('main');
            const fallbackModels = this.configManager.getModelsByRole('fallback');
            const researchModels = this.configManager.getModelsByRole('research');

            const results = [];
            if (mainModels.length > 0) results.push(`主要模型: ${mainModels.length}个`);
            if (fallbackModels.length > 0) results.push(`备用模型: ${fallbackModels.length}个`);
            if (researchModels.length > 0) results.push(`研究模型: ${researchModels.length}个`);

            // 测试按服务商选择模型
            for (const provider of providers) {
                const providerModels = this.configManager.getModelsByProvider(provider.id);
                results.push(`${provider.name}: ${providerModels.length}个模型`);
            }

            return {
                passed: true,
                details: `✅ 模型选择测试通过\n${results.join('\n')}`
            };

        } catch (error) {
            return {
                passed: false,
                details: '模型选择测试失败',
                errors: [error.message]
            };
        }
    }

    /**
     * 测试任务创建功能（模拟）
     */
    async testTaskCreation() {
        try {
            const providers = await this.configManager.getProviders();
            const models = await this.configManager.getModels();

            // 检查是否有有效的服务商
            const validProviders = providers.filter(p => p.isValid && p.apiKey);
            
            if (validProviders.length === 0) {
                return {
                    passed: false,
                    details: '没有有效的服务商可用于任务创建',
                    errors: ['需要至少一个配置了API密钥的有效服务商']
                };
            }

            // 检查是否有主要角色的模型
            const mainModels = models.filter(m => m.allowedRoles?.includes('main'));
            
            if (mainModels.length === 0) {
                return {
                    passed: false,
                    details: '没有可用于主要角色的模型',
                    errors: ['需要至少一个支持主要角色的模型']
                };
            }

            // 模拟任务创建配置
            const taskConfig = {
                provider: validProviders[0],
                model: mainModels[0],
                task: {
                    title: '测试任务',
                    description: '这是一个测试任务',
                    priority: 'medium'
                }
            };

            return {
                passed: true,
                details: `✅ 任务创建配置有效\n服务商: ${taskConfig.provider.name}\n模型: ${taskConfig.model.name || taskConfig.model.modelId}`
            };

        } catch (error) {
            return {
                passed: false,
                details: '任务创建测试失败',
                errors: [error.message]
            };
        }
    }

    /**
     * 测试配置验证
     */
    async testConfigValidation() {
        try {
            const providers = await this.configManager.getProviders();
            const models = await this.configManager.getModels();

            // 验证UI配置
            const uiValidation = this.transformer.validateUiConfig(providers, models);
            
            if (!uiValidation.isValid) {
                return {
                    passed: false,
                    details: 'UI配置验证失败',
                    errors: uiValidation.errors
                };
            }

            // 转换并验证TaskMaster配置
            const taskMasterConfig = this.transformer.uiToTaskMaster(providers, models);
            const tmValidation = this.transformer.validateTaskMasterConfig(taskMasterConfig);
            
            if (!tmValidation.isValid) {
                return {
                    passed: false,
                    details: 'TaskMaster配置验证失败',
                    errors: tmValidation.errors
                };
            }

            return {
                passed: true,
                details: '✅ 所有配置验证通过'
            };

        } catch (error) {
            return {
                passed: false,
                details: '配置验证测试失败',
                errors: [error.message]
            };
        }
    }

    /**
     * 测试端到端流程
     */
    async testEndToEndFlow() {
        try {
            // 1. 获取当前配置
            const providers = await this.configManager.getProviders();
            const models = await this.configManager.getModels();

            // 2. 转换为TaskMaster格式
            const taskMasterConfig = this.transformer.uiToTaskMaster(providers, models);

            // 3. 验证转换结果
            const validation = this.transformer.validateTaskMasterConfig(taskMasterConfig);
            if (!validation.isValid) {
                throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
            }

            // 4. 转换回UI格式
            const backToUI = this.transformer.taskMasterToUi(taskMasterConfig);

            // 5. 验证数据完整性
            const dataIntegrityCheck = this.checkDataIntegrity(
                { providers, models }, 
                backToUI
            );

            if (!dataIntegrityCheck.passed) {
                return dataIntegrityCheck;
            }

            return {
                passed: true,
                details: `✅ 端到端流程测试通过\n${dataIntegrityCheck.details}`
            };

        } catch (error) {
            return {
                passed: false,
                details: '端到端流程测试失败',
                errors: [error.message]
            };
        }
    }

    /**
     * 检查数据完整性
     */
    checkDataIntegrity(original, converted) {
        const issues = [];
        
        // 检查服务商数量
        if (original.providers.length !== converted.providers.length) {
            issues.push(`服务商数量不匹配: ${original.providers.length} -> ${converted.providers.length}`);
        }

        // 检查模型数量
        if (original.models.length !== converted.models.length) {
            issues.push(`模型数量不匹配: ${original.models.length} -> ${converted.models.length}`);
        }

        // 检查关键字段
        for (const originalProvider of original.providers) {
            const convertedProvider = converted.providers.find(p => p.name === originalProvider.name);
            if (!convertedProvider) {
                issues.push(`服务商丢失: ${originalProvider.name}`);
            }
        }

        for (const originalModel of original.models) {
            const convertedModel = converted.models.find(m => m.modelId === originalModel.modelId);
            if (!convertedModel) {
                issues.push(`模型丢失: ${originalModel.modelId}`);
            }
        }

        return {
            passed: issues.length === 0,
            details: issues.length === 0 ? 
                `数据完整性检查通过 (${original.providers.length}个服务商, ${original.models.length}个模型)` :
                `数据完整性问题: ${issues.join(', ')}`,
            errors: issues
        };
    }
}
