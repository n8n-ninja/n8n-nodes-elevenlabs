import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { returnBinary } from '../../methods/returnBinary';
import { binaryNameParameter, fileNameParameter } from '../shared/parameters';

/* Operation */
export const getHistoryAudioOperation: INodePropertyOptions = {
	name: 'Get History Audio',
	value: 'get-history-audio',
	action: 'Returns an history audio',
	description: 'Returns the audio of an history item',
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
};

const displayOptions = {
	show: {
		operation: ['get-history-audio'],
	},
};

/* Parameters */
export const getHistoryAudioParameters: INodeProperties[] = [
	{
		displayName: 'History Item ID',
		name: 'history_item_id',
		type: 'string',
		default: '',
		description: 'History item ID to be used, you can use',
		displayOptions,
		required: true,
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		default: {},
		placeholder: 'Add Fields',
		displayOptions,
		options: [binaryNameParameter, fileNameParameter],
	},
];
