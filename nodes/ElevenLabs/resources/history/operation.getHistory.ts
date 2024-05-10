import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { voiceIdParameter } from '../shared/parameters';

/* Operation */
export const getHistoryOperation: INodePropertyOptions = {
	name: 'Get History',
	value: 'get-history',
	action: 'Get history',
	description: 'Returns metadata about all your generated audio',
	routing: {
		request: {
			method: 'GET',
			url: '={{"/history"}}',
			qs: {
				page_size: '={{$parameter.page_size}}',
				last_history_item_id: '={{$parameter.last_history_item_id}}',
				voice_id: '={{$parameter.voice_id || undefined}}',
			},
		},
		output: {
			postReceive: [
				{
					type: 'rootProperty',
					properties: {
						property: 'history',
					},
				},
			],
		},
	},
};

const displayOptions = {
	show: {
		operation: ['get-history'],
	},
};

/* Parameters */
export const getHistoryParameters: INodeProperties[] = [
	{
		displayName: 'Page Size',
		name: 'page_size',
		type: 'number',
		default: 100,
		description: 'How many history items to return at maximum. Can not exceed 1000.',
		displayOptions,
	},
	{
		displayName: 'Last Item ID',
		name: 'last_history_item_id',
		type: 'string',
		default: '',
		description:
			'After which ID to start fetching, use this parameter to paginate across a large collection of history items',
		displayOptions,
	},
	{
		...voiceIdParameter,
		displayOptions,
	},
];
