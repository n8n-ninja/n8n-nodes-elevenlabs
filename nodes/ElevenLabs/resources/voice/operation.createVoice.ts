import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { voiceDescriptionAndLabels, voiceName } from '../shared/parameters';

/* Operation */
export const createVoiceOperation: INodePropertyOptions = {
	name: 'Create Voice',
	value: 'create-voice',
	action: 'Create voice from generated ID',
	description: 'Creates a voice from a generated voice, adds it to your library',
	routing: {
		request: {
			url: '={{"voice-generation/create-voice"}}',
			method: 'POST',
			body: {
				voice_name: '={{$parameter["name"]}}',
				voice_description: '={{$parameter["additionalFields"]["description"]}}',
				labels: '={{$parameter["additionalFields"]["labels"]}}',
				generated_voice_id: '={{$parameter["generated_voice_id"]}}',
			},
		},
	},
};

const displayOptions = {
	show: {
		operation: ['create-voice'],
	},
};

/* Parameters */
export const createVoiceParameters: INodeProperties[] = [
	// Notice
	{
		displayName:
			'This creates a voice from a generated_voice_id, generated with the "Generate Voice" operation, and adds it to your library',
		name: 'notice',
		type: 'notice',
		default: '',
		displayOptions,
	},
	// Generated voice ID
	{
		displayName: 'Generation Voice ID',
		description: 'The generated_voice_id of the generated voice',
		required: true,
		name: 'generated_voice_id',
		type: 'string',
		default: '',
		displayOptions,
	},
	// Voice name
	{
		...voiceName,
		displayOptions,
	},
	// Additional fields
	{
		...voiceDescriptionAndLabels,
		displayOptions,
	},
];
