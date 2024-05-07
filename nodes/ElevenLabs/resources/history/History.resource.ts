import { INodeProperties } from 'n8n-workflow';
import { getHistoryOperation, getHistoryParameters } from './operation.getHistory';
import { getHistoryAudioOperation, getHistoryAudioParameters } from './operation.getHistoryAudio';
import {
	deleteHistoryItemOperation,
	deleteHistoryItemParameters,
} from './operation.deleteHistoryItem';

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
		options: [getHistoryOperation, getHistoryAudioOperation, deleteHistoryItemOperation],
		default: '',
	},

	// Parameters
	...getHistoryParameters,
	...getHistoryAudioParameters,
	...deleteHistoryItemParameters,
];
