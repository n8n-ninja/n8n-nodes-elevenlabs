import { INodeProperties } from 'n8n-workflow';
import { generateVoiceOperation, generateVoiceParameters } from './operation.generateVoice';
import { createVoiceOperation, createVoiceParameters } from './operation.createVoice';
import { deleteVoiceOperation, deleteVoiceParameters } from './operation.deleteVoice';
import { listVoicesOperation, listVoicesParameters } from './operation.listVoices';
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
