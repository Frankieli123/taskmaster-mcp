/**
 * t.js
 * AI provider implementation for t using OpenAI-compatible API.
 */

import { createOpenAI } from '@ai-sdk/openai';
import { BaseAIProvider } from './base-provider.js';

export class TProvider extends BaseAIProvider {
    constructor() {
        super();
        this.name = 't';
    }

    /**
     * Creates and returns a t client instance.
     * @param {object} params - Parameters for client initialization
     * @param {string} params.apiKey - t API key
     * @param {string} [params.baseURL] - Optional custom API endpoint
     * @returns {Function} t client function
     * @throws {Error} If API key is missing or initialization fails
     */
    getClient(params) {
        try {
            const { apiKey, baseURL } = params;

            if (!apiKey) {
                throw new Error('t API key is required.');
            }

            // 使用配置的API端点，可以通过baseURL参数覆盖
            const effectiveBaseURL = baseURL || 'https://tbai.xin';

            // 确保baseURL以/v1结尾（如果需要）
            const normalizedBaseURL = effectiveBaseURL.endsWith('/v1')
                ? effectiveBaseURL
                : `${effectiveBaseURL}/v1`.replace(/\/+v1$/g, '/v1');

            return createOpenAI({
                apiKey,
                baseURL: normalizedBaseURL
            });
        } catch (error) {
            this.handleError('client initialization', error);
        }
    }

    /**
     * Maps t model IDs to actual API model names
     * @param {string} modelId - The model ID from supported-models.json
     * @returns {string} The actual model name to use with the API
     */
    mapModelId(modelId) {
        // 自动去除t-前缀，类似poloai的处理方式
        if (modelId.startsWith('t-')) {
            return modelId.replace('t-', '');
        }

        // 对于特殊情况的手动映射（如果需要）
        const modelMap = {
            // 在这里添加特殊的模型映射，如果有的话
        };

        return modelMap[modelId] || modelId;
    }

    /**
     * Generates text using t with model ID mapping
     */
    async generateText(params) {
        // Map the model ID to the actual API model name
        const mappedParams = {
            ...params,
            modelId: this.mapModelId(params.modelId)
        };

        // Call the parent generateText with mapped model ID
        return super.generateText(mappedParams);
    }

    /**
     * Generates streaming text using t with model ID mapping
     */
    async streamText(params) {
        // Map the model ID to the actual API model name
        const mappedParams = {
            ...params,
            modelId: this.mapModelId(params.modelId)
        };

        // Call the parent streamText with mapped model ID
        return super.streamText(mappedParams);
    }

    /**
     * Generates object using t with model ID mapping
     */
    async generateObject(params) {
        // Map the model ID to the actual API model name
        const mappedParams = {
            ...params,
            modelId: this.mapModelId(params.modelId)
        };

        // Call the parent generateObject with mapped model ID
        return super.generateObject(mappedParams);
    }
}
