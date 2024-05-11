import {
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	IN8nHttpFullResponse,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';

export const SpeechOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['speech'],
			},
		},
		options: [
			{
				name: 'Text to Speech',
				value: 'text-to-speech',
				action: 'Generate speech from text',
				description: 'Generate a speech from a text',
			},
			{
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
			},
		],
		default: 'text-to-speech',
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
						stability: `={{$parameter["additionalFields"]["stability"] || 0.5 }}`,
						similarity_boost: `={{$parameter["additionalFields"]["similarity_boost"] || 0.75 }}`,
						style: `={{$parameter["additionalFields"]["style"] || 0 }}`,
						use_speaker_boost: '={{$parameter["additionalFields"]["use_speaker_boost"]}}',
					},
					seed: '={{$parameter["additionalFields"]["seed"]}}',
				},
			},
			output: {
				postReceive: [returnBinary],
			},
		},
	},

	// Text
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

	// Voice ID
	{
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
		displayOptions: {
			show: {
				resource: ['speech'],
			},
		},
		required: true,
	},

	// Additional fields
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		default: {},
		placeholder: 'Add Fields',
		displayOptions: {
			show: {
				resource: ['speech'],
			},
		},
		options: [
			{
				displayName: 'Binary Name',
				description: 'Change the output binary name',
				name: 'binary_name',
				type: 'string',
				default: 'data',
			},
			{
				displayName: 'File Name',
				description: 'Change the output file name',
				name: 'file_name',
				type: 'string',
				default: 'voice',
			},
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
				default: 0.5,
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
				default: 0.75,
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
				default: 0,
				typeOptions: {
					maxValue: 1,
					minValue: 0,
					numberStepSize: 0.01,
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
		],
	},
];

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

async function returnBinary<PostReceiveAction>(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
	responseData: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	const binary_name = this.getNodeParameter('additionalFields["binary_name"]', 'data') as string;
	const file_name = this.getNodeParameter('additionalFields["file_name"]', 'voice') as string;

	const binaryData = await this.helpers.prepareBinaryData(
		responseData.body as Buffer,
		file_name,
		'audio/mp3',
	);

	return items.map(() => ({ json: responseData.headers, binary: { [binary_name]: binaryData } }));
}
