import { INodeProperties } from 'n8n-workflow';
import { defaultSettings } from '../../config';
import { returnBinary } from '../../methods/returnBinary';
import { binaryNameParameter, fileNameParameter, voiceIdParameter } from '../shared/parameters';
import { speechToSpeechOperation } from './operation.speechToSpeech';
import { textToSpeechOperation, textToSpeechParameters } from './operation.textToSpeech';

const displayOptions = {
	show: {
		resource: ['speech'],
	},
};

const defaultStability = defaultSettings.stability;
const defaultSimilarity_boost = defaultSettings.similarity_boost;
const defaultStyle = defaultSettings.style;

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
						stability: `={{$parameter["additionalFields"]["stability"] || ${defaultSettings.stability}}}`,
						similarity_boost: `={{$parameter["additionalFields"]["similarity_boost"] || ${defaultSettings.similarity_boost}}}`,
						style: `={{$parameter["additionalFields"]["style"] || ${defaultSettings.style}}}`,
						use_speaker_boost: '={{$parameter["additionalFields"]["use_speaker_boost"]}}',
					},
					seed: '={{$parameter["additionalFields"]["seed"]}}',
					// Todo Implement dictionary locators
					// pronunciation_dictionary_locators:
					// 	'={{JSON.parse($parameter["additionalFields"]["pronunciation_dictionary_locators"])}}',
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
				default: defaultStability,
				typeOptions: {
					maxValue: 1,
					minValue: 0,
					numberStepSize: 0.01,
				},
			},
			// similarity_boost
			{
				displayName: 'Similarity Boost',
				description: 'Define voice similarity boost',
				name: 'similarity_boost',
				type: 'number',
				default: defaultSimilarity_boost,
				typeOptions: {
					maxValue: 1,
					minValue: 0,
					numberStepSize: 0.01,
				},
			},
			// style
			{
				displayName: 'Style',
				description: 'Exaggerate voice style',
				name: 'style',
				type: 'number',
				default: defaultStyle,
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
			// TODO: pronunciation_dictionary_locators
			// 			{
			// 				displayName: 'Pronunciation Dictionary Locators',
			// 				description:
			// 					'A list of pronunciation dictionary locators (ID, version_id) to be applied to the text. (up to 3).',
			// 				name: 'pronunciation_dictionary_locators',
			// 				type: 'json',
			// 				default: `[
			// 	{
			// 		"pronunciation_dictionary_id": "xxx",
			// 		"version_id": "1"
			// 	}
			// ]`,
			// 			},
		],
	},
];
