import { IExecuteSingleFunctions, IHttpRequestOptions, INodePropertyOptions } from 'n8n-workflow';
import { returnBinary } from '../../methods/returnBinary';

/* Operation */
export const speechToSpeechOperation: INodePropertyOptions = {
	name: 'Speech to Speech',
	value: 'speech-to-speech',
	action: 'Generate speech from speech',
	description: 'Generate a speech from a speech',
	routing: {
		send: {
			preSend: [preSendUploadAudio],
		},
		request: {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		},
		output: {
			postReceive: [returnBinary],
		},
	},
};

async function preSendUploadAudio(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const formData = new FormData();
	const audioBuffer = await this.helpers.getBinaryDataBuffer('data');

	formData.append('audio', new Blob([audioBuffer]));
	requestOptions.body = formData;

	return requestOptions;
}
