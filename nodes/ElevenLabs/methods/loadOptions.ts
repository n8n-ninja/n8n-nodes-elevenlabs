import type { ILoadOptionsFunctions } from 'n8n-workflow';

async function loadResource(this: ILoadOptionsFunctions, resource: 'genders' | 'ages' | 'accents') {
	const results = await this.helpers.httpRequest({
		url: 'https://api.elevenlabs.io/v1/voice-generation/generate-voice/parameters',
	});

	return results[resource].map((entry: { name: string; code: string }) => ({
		name: entry.name,
		value: entry.code,
	}));
}

async function loadModels(this: ILoadOptionsFunctions) {
	const results = await this.helpers.httpRequestWithAuthentication.call(this, 'elevenLabsApi', {
		url: 'https://api.elevenlabs.io/v1/models',
	});

	return results.map((entry: { name: string; model_id: string }) => ({
		name: entry.name,
		value: entry.model_id,
	}));
}

export const loadOptions = {
	async listVoiceGenders(this: ILoadOptionsFunctions) {
		return await loadResource.call(this, 'genders');
	},
	async listVoiceAges(this: ILoadOptionsFunctions) {
		return await loadResource.call(this, 'ages');
	},
	async listVoiceAccents(this: ILoadOptionsFunctions) {
		return await loadResource.call(this, 'accents');
	},
	async listModels(this: ILoadOptionsFunctions) {
		return await loadModels.call(this);
	},
};
