import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { voiceIdParameter } from '../shared/parameters';

/* Operation */
export const deleteVoiceOperation: INodePropertyOptions = {
	name: 'Delete Voice',
	value: 'delete-voice',
	action: 'Delete a voice',
	description: 'Delete a voice from your library',
	routing: {
		request: {
			url: '={{"/voices/" + $parameter["voice_id"]}}',
			method: 'DELETE',
		},
	},
};

const displayOptions = {
	show: {
		operation: ['delete-voice'],
	},
};

/* Parameters */
export const deleteVoiceParameters: INodeProperties[] = [
	{
		...voiceIdParameter,
		displayOptions,
	},
];
