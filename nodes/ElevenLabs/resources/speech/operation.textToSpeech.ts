import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

/* Operation */
export const textToSpeechOperation: INodePropertyOptions = {
	name: 'Text to Speech',
	value: 'text-to-speech',
	action: 'Generate speech from text',
	description: 'Generate a speech from a text',
};

/* Parameters */
export const textToSpeechParameters: INodeProperties[] = [
	{
		displayName: 'Text',
		description: 'The Text to transform into Speech',
		required: true,
		name: 'text',
		type: 'string',
		default: 'Be good to people!',
		displayOptions: {
			show: {
				operation: ['text-to-speech'],
			},
		},
		routing: {
			request: {
				body: {
					text: '={{$value}}',
				},
			},
		},
	},
];
