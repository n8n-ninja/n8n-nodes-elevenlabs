import { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { BASE_URL } from './config';
import { listSearch } from './methods/listSearch';
import { loadOptions } from './methods/loadOptions';
import { HistoryOperations } from './resources/history/History.resource';
import { SpeechOperation } from './resources/speech/Speech.resource';
import { UserOperations } from './resources/user/User.resource';
import { VoiceOperations } from './resources/voice/Voice.resource';

export class ElevenLabs implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ElevenLabs',
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
			baseURL: BASE_URL,
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
				default: 'voice',
			},

			...SpeechOperation,
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
