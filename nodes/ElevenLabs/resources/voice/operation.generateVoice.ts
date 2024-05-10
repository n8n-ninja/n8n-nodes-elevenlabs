import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { defaultSettings } from '../../config';
import { returnBinary } from '../../methods/returnBinary';
import { binaryNameParameter, fileNameParameter } from '../shared/parameters';

/* Operation */
export const generateVoiceOperation: INodePropertyOptions = {
	name: 'Generate Voice',
	value: 'generate-voice',
	action: 'Generate new voice',
	description: 'Generates a new unique random voice based on parameters',
	routing: {
		request: {
			method: 'POST',
			encoding: 'arraybuffer',
			returnFullResponse: true,
			url: '={{"/voice-generation/generate-voice"}}',
			body: {
				age: '={{$parameter["age"]}}',
				gender: '={{$parameter["gender"]}}',
				accent: '={{$parameter["accent"]}}',
				accent_strength: `={{$parameter["additionalFields"]["accent_strength"] || ${defaultSettings.defaultAccentStrength}}}`,
				text: `={{$parameter["additionalFields"]["text"] || "${defaultSettings.defaultText}" }}`,
			},
		},
		output: {
			postReceive: [
				returnBinary,
				async function (this, items, responseData) {
					return items.map((item) => ({
						...item,
						json: {
							generated_voice_id: responseData.headers.generated_voice_id,
							age: this.getNodeParameter('age'),
							gender: this.getNodeParameter('gender'),
							accent: this.getNodeParameter('accent'),
							accent_strength: this.getNodeParameter(
								'additionalFields.accent_strength',
								defaultSettings.defaultAccentStrength,
							),
						},
					}));
				},
			],
		},
	},
};

const displayOptions = {
	show: {
		operation: ['generate-voice'],
	},
};

/* Parameters */
export const generateVoiceParameters: INodeProperties[] = [
	// Notice
	{
		displayName:
			'This generates a voice and returns a generated_voice_id with an audio sample. If you like the generated voice call "Create Voice" with the generated_voice_id to create the voice.',
		name: 'notice',
		type: 'notice',
		default: '',
		displayOptions,
	},
	// Gender
	{
		displayName: 'Gender',
		description: 'The gender of the speaker.',
		required: true,
		name: 'gender',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'listVoiceGenders',
		},
		default: '',
		displayOptions,
	},
	// Accent
	{
		displayName: 'Accent',
		description: 'The accent of the speaker.',
		required: true,
		name: 'accent',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'listVoiceAccents',
		},
		default: '',
		displayOptions,
	},
	// Age
	{
		displayName: 'Age',
		description: 'The age of the speaker',
		required: true,
		name: 'age',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'listVoiceAges',
		},
		default: '',
		displayOptions,
	},
	/* Additional fields */
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		default: {},
		placeholder: 'Add Fields',
		displayOptions,
		options: [
			{
				...binaryNameParameter,
			},
			{
				...fileNameParameter,
			},
			// Text
			{
				displayName: 'Sample Text',
				description: 'Sample text to use for voice generation',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: defaultSettings.defaultText,
			},
			// Accent Strength
			{
				displayName: 'Accent Strength',
				required: true,
				name: 'accent_strength',
				type: 'number',
				typeOptions: {
					maxValue: 2,
					minValue: 0.3,
					numberStepSize: 0.01,
				},
				default: defaultSettings.defaultAccentStrength,
			},
		],
	},
];
