import { INodeProperties } from 'n8n-workflow';
import { returnBinary } from '../../methods/returnBinary';
import { binaryNameParameter, fileNameParameter, voiceIdParameter } from '../shared/parameters';
import { speechToSpeechOperation } from './operation.speechToSpeech';
import { textToSpeechOperation, textToSpeechParameters } from './operation.textToSpeech';

const displayOptions = {
	show: {
		resource: ['speech'],
	},
};

export const SpeechOperation: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions,
		options: [textToSpeechOperation, speechToSpeechOperation],
		default: '',
		routing: {
			request: {
				url: '={{"/" + $parameter["operation"] + "/" + $parameter["voice_id"]}}',
				qs: {
					optimize_streaming_latency:
						'={{$parameter["additionalFields"]["optimize_streaming_latency"]}}',
					output_format: '={{$parameter["additionalFields"]["output_format"]}}',
				},
				returnFullResponse: true,
				encoding: 'arraybuffer',
				body: {
					model_id: '={{$parameter["additionalFields"]["model_id"]}}',
					voice_settings: {
						stability: '={{($parameter["additionalFields"]["stability"] || 50) / 100}}',
						similarity_boost:
							'={{($parameter["additionalFields"]["similarity_boost"] || 50) / 100}}',
						style: '={{($parameter["additionalFields"]["style"] || 50) / 100}}',
						use_speaker_boost: '={{$parameter["additionalFields"]["use_speaker_boost"]}}',
					},
					seed: '={{$parameter["additionalFields"]["seed"]}}',
					pronunciation_dictionary_locators:
						'={{JSON.parse($parameter["additionalFields"]["pronunciation_dictionary_locators"])}}',
				},
			},
			output: {
				postReceive: [returnBinary],
			},
		},
	},

	// Text
	...textToSpeechParameters,

	// Voice ID
	{
		...voiceIdParameter,
		displayOptions,
		required: true,
	},

	// Additional fields
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		default: {},
		placeholder: 'Add Fields',
		displayOptions,
		options: [
			binaryNameParameter,
			fileNameParameter,
			// optimize_streaming_latency
			{
				displayName: 'Streaming Latency',
				description: 'Turn on latency optimizations at some cost of quality',
				name: 'optimize_streaming_latency',
				type: 'number',
				default: 0,
				typeOptions: {
					maxValue: 4,
					minValue: 0,
					numberStepSize: 1,
				},
			},
			// output_format
			{
				displayName: 'Output Format',
				description: 'Output format of the generated audio',
				name: 'output_format',
				type: 'string',
				default: 'mp3_44100_128',
			},
			// model_id
			{
				displayName: 'Model Name or ID',
				description:
					'Identifier of the model that will be used. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
				name: 'model_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'listModels',
				},
				default: '',
			},
			// stability
			{
				displayName: 'Stability',
				description: 'Define voice stability',
				name: 'stability',
				type: 'number',
				default: 50,
				typeOptions: {
					maxValue: 100,
					minValue: 0,
					numberStepSize: 1,
				},
			},
			// similarity_boost
			{
				displayName: 'Similarity Boost',
				description: 'Define voice similarity boost',
				name: 'similarity_boost',
				type: 'number',
				default: 50,
				typeOptions: {
					maxValue: 100,
					minValue: 0,
					numberStepSize: 1,
				},
			},
			// style
			{
				displayName: 'Style',
				description: 'Exaggerate voice style',
				name: 'style',
				type: 'number',
				default: 50,
				typeOptions: {
					maxValue: 100,
					minValue: 0,
					numberStepSize: 1,
				},
			},
			// use_speaker_boost
			{
				displayName: 'Speaker Boost',
				description: 'Whether speaker boost is activated',
				name: 'use_speaker_boost',
				type: 'boolean',
				default: false,
			},
			// seed
			{
				displayName: 'Seed',
				description: 'Define a fixed seed',
				name: 'seed',
				type: 'number',
				default: 0,
			},
			// pronunciation_dictionary_locators
			{
				displayName: 'Pronunciation Dictionary Locators',
				description:
					'A list of pronunciation dictionary locators (ID, version_id) to be applied to the text. (up to 3).',
				name: 'pronunciation_dictionary_locators',
				type: 'json',
				default: `[
	{
		"pronunciation_dictionary_id": "xxx",
		"version_id": "1"
	}
]`,
			},
		],
	},
];
