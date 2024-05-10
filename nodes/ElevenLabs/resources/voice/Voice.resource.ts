import { INodeProperties } from 'n8n-workflow';
import { cloneVoiceOperation, cloneVoiceParameters } from './operation.cloneVoice';
import { createVoiceOperation, createVoiceParameters } from './operation.createVoice';
import { deleteVoiceOperation, deleteVoiceParameters } from './operation.deleteVoice';
import { generateVoiceOperation, generateVoiceParameters } from './operation.generateVoice';
import { getVoiceDetailsOperation, getVoiceDetailsParameters } from './operation.getVoiceDetails';
import { listVoicesOperation, listVoicesParameters } from './operation.listVoices';

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
			listVoicesOperation,
			generateVoiceOperation,
			createVoiceOperation,
			cloneVoiceOperation,
			getVoiceDetailsOperation,
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
	...listVoicesParameters,
];
