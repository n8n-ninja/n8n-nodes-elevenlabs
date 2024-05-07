import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

/* Operation */
export const deleteHistoryItemOperation: INodePropertyOptions = {
	name: 'Delete History Item',
	value: 'delete-history-item',
	action: 'Delete an history item',
	description: 'Delete a history item by its ID',
	routing: {
		request: {
			method: 'DELETE',
			url: '={{"/history/" + $parameter["history_item_id"]}}',
		},
	},
};

const displayOptions = {
	show: {
		operation: ['delete-history-item'],
	},
};

/* Parameters */
export const deleteHistoryItemParameters: INodeProperties[] = [
	{
		displayName: 'History Item ID',
		name: 'history_item_id',
		type: 'string',
		default: '',
		description: 'History item ID to be used',
		displayOptions,
		required: true,
	},
];
