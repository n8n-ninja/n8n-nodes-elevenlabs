import { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { listSearch } from './methods/listSearch';
import { loadOptions } from './methods/loadOptions';
// import { debugRequest } from './methods/debugRequest';
import { HistoryOperations } from './resources/history';
import { SpeechOperations } from './resources/speech';
import { UserOperations } from './resources/user';
import { VoiceOperations } from './resources/voice';

export class ElevenLabs implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ElevenLabs - Beta',
		name: 'elevenLabs',
		icon: 'file:elevenlabs.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Generate and manipulate AI voice using ElevenLabs and n8n.',
		defaults: {
			name: 'ElevenLabs',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'elevenLabsApi',
				required: true,
			},
		],
		requestDefaults: {
			method: 'POST',
			baseURL: 'https://api.elevenlabs.io/v1',
			headers: {
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Speech',
						value: 'speech',
					},
					{
						name: 'Voice',
						value: 'voice',
					},
					{
						name: 'History',
						value: 'history',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'speech',
				// routing: {
				// 	send: {
				// 		preSend: [debugRequest],
				// 	},
				// },
			},

			...SpeechOperations,
			...VoiceOperations,
			...HistoryOperations,
			...UserOperations,
		],
	};

	methods = {
		loadOptions,
		listSearch,
	};
}
