import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

/* Operation */
export const getMyVoicesOperation: INodePropertyOptions = {
	name: 'Get My Voices',
	value: 'get-my-voices',
	action: 'Returns my voices',
	description: 'Returns a list of the voices from my library',
	routing: {
		request: {
			method: 'GET',
			url: '={{"/voices"}}',
		},
		output: {
			postReceive: [
				{
					type: 'rootProperty',
					properties: {
						property: 'voices',
					},
				},
				{
					type: 'filter',
					enabled: '={{!$parameter["includePremade"]}}',
					properties: {
						pass: '={{$responseItem.category!=="premade"}}',
					},
				},
				{
					type: 'setKeyValue',
					enabled: '={{$parameter["simplify"]}}',
					properties: {
						voice_id: '={{$responseItem.voice_id}}',
						name: '={{$responseItem.name}}',
						accent: '={{$responseItem.labels.accent}}',
						description: '={{$responseItem.labels.description}}',
						age: '={{$responseItem.labels.age}}',
						gender: '={{$responseItem.labels.gender}}',
						use_case: '={{$responseItem.labels["use case"]}}',
						high_quality_base_model_ids: '={{$responseItem.high_quality_base_model_ids}}',
					},
				},
			],
		},
	},
};

const displayOptions = {
	show: {
		operation: ['get-my-voices'],
	},
};

/* Parameters */
export const getMyVoicesParameters: INodeProperties[] = [
	{
		displayName: 'Simplify Output',
		name: 'simplify',
		type: 'boolean',
		default: true,
		description: 'Whether to return a simplified version of the response',
		displayOptions,
	},
	{
		displayName: 'Include Premade',
		name: 'includePremade',
		type: 'boolean',
		default: false,
		description: 'Whether to include premade voices in the response',
		displayOptions,
	},
];
