import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { BASE_URL } from '../config';

export const listSearch = {
	async listVoices(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
		const results = await this.helpers.httpRequestWithAuthentication.call(this, 'elevenLabsApi', {
			url: `${BASE_URL}/voices`,
		});

		const returnData: INodeListSearchItems[] = results.voices.map(
			(result: { name: string; category: string; voice_id: string }) => {
				return {
					name: result.name + (result.category == 'premade' ? ' (Premade)' : ''),
					value: result.voice_id,
				};
			},
		);

		return {
			results: returnData.reverse(),
		};
	},
};
