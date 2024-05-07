import { INodeProperties } from 'n8n-workflow';

export const voiceIdParameter: INodeProperties = {
	displayName: 'Voice ID',
	description: 'The voice you want to use',
	name: 'voice_id',
	type: 'resourceLocator',
	default: { mode: 'list', value: null },
	modes: [
		{
			displayName: 'From list',
			name: 'list',
			type: 'list',
			hint: 'Choose from list',
			typeOptions: {
				searchListMethod: 'listVoices',
				searchable: true,
			},
		},
		{
			displayName: 'ID',
			name: 'id',
			type: 'string',
			hint: 'Enter an ID',
			placeholder: 'XYZ123',
		},
	],
};

// Voice Name
export const voiceName: INodeProperties = {
	displayName: 'Name',
	description: 'Voice name',
	name: 'name',
	type: 'string',
	default: 'n8n voice',
};

// Voice Creation Additional Infos
export const voiceDescriptionAndLabels: INodeProperties = {
	displayName: 'Additional Fields',
	name: 'additionalFields',
	type: 'collection',
	default: {},
	placeholder: 'Add Fields',
	options: [
		// Description
		{
			displayName: 'Description',
			description: 'Voice description',
			name: 'description',
			type: 'string',
			default: 'Generated with n8n',
		},
		// Labels
		{
			displayName: 'Labels (JSON)',
			description: 'Labels to describe this voice (max 5)',
			name: 'labels',
			type: 'json',
			default: `{
"language": "en",
"descriptive": "custom",
"generated": "with n8n"
}`,
		},
	],
};

// binary_name
export const binaryNameParameter: INodeProperties = {
	displayName: 'Binary Name',
	description: 'Change the output binary name',
	name: 'binary_name',
	type: 'string',
	default: 'data',
};

// file_name
export const fileNameParameter: INodeProperties = {
	displayName: 'File Name',
	description: 'Change the output file name',
	name: 'file_name',
	type: 'string',
	default: 'voice',
};
