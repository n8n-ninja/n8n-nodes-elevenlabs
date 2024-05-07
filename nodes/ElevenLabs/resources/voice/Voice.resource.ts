import { INodeProperties } from 'n8n-workflow';
import { generateVoiceOperation, generateVoiceParameters } from './operation.generateVoice';
import { createVoiceOperation, createVoiceParameters } from './operation.createVoice';
import { deleteVoiceOperation, deleteVoiceParameters } from './operation.deleteVoice';
import { getMyVoicesOperation, getMyVoicesParameters } from './operation.getMyVoices';
import { cloneVoiceOperation, cloneVoiceParameters } from './operation.cloneVoice';
import { getVoiceDetailsOperation, getVoiceDetailsParameters } from './operation.getVoiceDetails';

export const VoiceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['voice'],
			},
		},
		options: [
			getMyVoicesOperation,
			getVoiceDetailsOperation,
			generateVoiceOperation,
			createVoiceOperation,
			cloneVoiceOperation,
			deleteVoiceOperation,
		],
		default: '',
	},

	// Parameters
	...deleteVoiceParameters,
	...getVoiceDetailsParameters,
	...generateVoiceParameters,
	...createVoiceParameters,
	...cloneVoiceParameters,
	...getMyVoicesParameters,
];
