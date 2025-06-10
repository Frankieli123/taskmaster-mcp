/**
 * polo.js
 * AI provider implementation for PoloAPI (Gemini models) using OpenAI-compatible API.
 */

import { createOpenAI } from '@ai-sdk/openai';
import { BaseAIProvider } from './base-provider.js';

export class PoloAIProvider extends BaseAIProvider {
	constructor() {
		super();
		this.name = 'Polo';
	}

	/**
	 * Creates and returns a Polo client instance.
	 * @param {object} params - Parameters for client initialization
	 * @param {string} params.apiKey - Polo API key
	 * @param {string} [params.baseURL] - Optional custom API endpoint (defaults to https://poloai.top/v1)
	 * @returns {Function} Polo client function
	 * @throws {Error} If API key is missing or initialization fails
	 */
	getClient(params) {
		try {
			const { apiKey, baseURL } = params;

			if (!apiKey) {
				throw new Error('Polo API key is required.');
			}

			// PoloAPI使用OpenAI兼容的API格式，但需要确保URL包含/v1路径
			const effectiveBaseURL = baseURL || 'https://poloai.top/v1';
			
			// 确保baseURL以/v1结尾
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
}
