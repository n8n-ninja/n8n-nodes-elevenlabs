import {
	IExecuteSingleFunctions,
	IN8nHttpFullResponse,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';

export const HistoryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['history'],
			},
		},
		options: [
			{
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
			},
			{
				name: 'Get History Audio',
				value: 'get-history-audio',
				action: 'Download history item audio',
				description: 'Downloads the audio of an history item',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/history/" + $parameter["history_item_id"] + "/audio"}}',
						returnFullResponse: true,
						encoding: 'arraybuffer',
					},
					output: {
						postReceive: [returnBinary],
					},
				},
			},
			{
				name: 'Delete History Item',
				value: 'delete-history-item',
				action: 'Delete history item',
				description: 'Delete an history item by its ID',
				routing: {
					request: {
						method: 'DELETE',
						url: '={{"/history/" + $parameter["history_item_id"]}}',
					},
				},
			},
		],
		default: 'get-history',
	},

	// Parameters
	{
		displayName: 'Page Size',
		name: 'page_size',
		type: 'number',
		default: 100,
		description: 'How many history items to return at maximum. Can not exceed 1000.',
		displayOptions: {
			show: {
				operation: ['get-history'],
			},
		},
	},
	{
		displayName: 'Last Item ID',
		name: 'last_history_item_id',
		type: 'string',
		default: '',
		description:
			'After which ID to start fetching, use this parameter to paginate across a large collection of history items',
		displayOptions: {
			show: {
				operation: ['get-history'],
			},
		},
	},
	{
		displayName: 'Voice ID',
		description: 'The voice you want to use',
		name: 'voice_id',
		type: 'resourceLocator',
		default: { mode: 'list', value: null },
		modes: [
			{
				displayName: 'From list',
				name: 'list',
				type: 'list',
				hint: 'Choose from list',
				typeOptions: {
					searchListMethod: 'listVoices',
					searchable: true,
				},
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				hint: 'Enter an ID',
				placeholder: 'XYZ123',
			},
		],
		displayOptions: {
			show: {
				operation: ['get-history'],
			},
		},
	},
	{
		displayName: 'History Item ID',
		name: 'history_item_id',
		type: 'string',
		default: '',
		description: 'History item ID to be used, you can use',
		displayOptions: {
			show: {
				operation: ['get-history-audio'],
			},
		},
		required: true,
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		default: {},
		placeholder: 'Add Fields',
		displayOptions: {
			show: {
				operation: ['get-history-audio'],
			},
		},
		options: [
			{
				displayName: 'Binary Name',
				description: 'Change the output binary name',
				name: 'binary_name',
				type: 'string',
				default: 'data',
			},
			{
				displayName: 'File Name',
				description: 'Change the output file name',
				name: 'file_name',
				type: 'string',
				default: 'voice',
			},
		],
	},
	{
		displayName: 'History Item ID',
		name: 'history_item_id',
		type: 'string',
		default: '',
		description: 'History item ID to be used',
		displayOptions: {
			show: {
				operation: ['delete-history-item'],
			},
		},
		required: true,
	},
];

async function returnBinary<PostReceiveAction>(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
	responseData: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	const binary_name = this.getNodeParameter('additionalFields["binary_name"]', 'data') as string;
	const file_name = this.getNodeParameter('additionalFields["file_name"]', 'voice') as string;

	const binaryData = await this.helpers.prepareBinaryData(
		responseData.body as Buffer,
		file_name,
		'audio/mp3',
	);

	return items.map(() => ({ json: responseData.headers, binary: { [binary_name]: binaryData } }));
}
