import { INodeProperties } from 'n8n-workflow';
import {
	deleteHistoryItemOperation,
	deleteHistoryItemParameters,
} from './operation.deleteHistoryItem';
import { getHistoryOperation, getHistoryParameters } from './operation.getHistory';
import { getHistoryAudioOperation, getHistoryAudioParameters } from './operation.getHistoryAudio';

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
