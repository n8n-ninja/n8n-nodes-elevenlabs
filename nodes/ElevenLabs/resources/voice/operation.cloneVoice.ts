import {
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
	INodePropertyOptions,
} from 'n8n-workflow';
import { defaultSettings } from '../../config';
import { voiceDescriptionAndLabels, voiceName } from '../shared/parameters';

/* Operation */
export const cloneVoiceOperation: INodePropertyOptions = {
	name: 'Clone Voice',
	value: 'clone-voice',
	action: 'Clone voice',
	description: 'Clones a voice from an mp3 file and adds it to your library',
	routing: {
		send: {
			preSend: [preSendUploadAudio],
		},
		output: {
			postReceive: [
				async function (this, items, responseData) {
					return items.map((item) => ({
						...item,
						json: {
							...item.json,
							name: this.getNodeParameter('name'),
							description: this.getNodeParameter(
								'additionalFields.description',
								defaultSettings.voiceDescription,
							) as string,
							labels: JSON.parse(this.getNodeParameter('additionalFields.labels', '{}') as string),
						},
					}));
				},
			],
		},
		request: {
			url: '={{"/voices/add"}}',
			returnFullResponse: true,
			method: 'POST',
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			// Body data are constructed in preSend method
		},
	},
};

/* Parameters */
const displayOptions = {
	show: {
		operation: ['clone-voice'],
	},
};

export const cloneVoiceParameters: INodeProperties[] = [
	// Voice Name
	{
		...voiceName,
		displayOptions,
	},
	// Additional Fields
	{
		...voiceDescriptionAndLabels,
		displayOptions,
	},
];

// Prepare request with uploaded files and parameters
async function preSendUploadAudio(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const formData = new FormData();
	const audioBuffer = await this.helpers.getBinaryDataBuffer('data');
	const name = this.getNodeParameter('name') as string;
	const description = this.getNodeParameter(
		'additionalFields.description',
		defaultSettings.voiceDescription,
	) as string;
	const labels = this.getNodeParameter('additionalFields.labels', '{}') as string;

	formData.append('name', name);
	formData.append('description', description);
	formData.append('labels', labels);
	formData.append('files', new Blob([audioBuffer]));

	requestOptions.body = formData;

	return requestOptions;
}
