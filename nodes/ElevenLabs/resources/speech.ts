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
				routing: {
					send: {
						preSend: [preSendText],
					},
				},
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
			// stitching
			{
				displayName: 'Stitching',
				description:
					'Whether stitching is activated (give the model context by passing past and previous text)',
				name: 'stitching',
				type: 'boolean',
				default: true,
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

async function preSendText(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const text = this.getNodeParameter('text') as string;
	const model_id = this.getNodeParameter('model_id', null) as string;
	const seed = this.getNodeParameter('seed', 0) as string;

	const stability = this.getNodeParameter('additionalFields.stability', 0.5);
	const similarity_boost = this.getNodeParameter('additionalFields.similarity_boost', 1);
	const style = this.getNodeParameter('additionalFields.style', 0);
	const use_speaker_boost = this.getNodeParameter('additionalFields.use_speaker_boost', true);
	const stitching = this.getNodeParameter('additionalFields.stitching', false);

	const data: any = {
		text: text,
		voice_settings: {
			stability: stability,
			similarity_boost: similarity_boost,
			style: style,
			use_speaker_boost: use_speaker_boost,
		},
	};

	// Stitching
	if (stitching) {
		if (seed) data.seed = seed;
		if (model_id) data.model_id = model_id;

		const runIndex = this.getItemIndex();
		const texts: string[] = [];

		this.getExecuteData().data.main[0]?.forEach((text) => {
			texts.push(text.json.text as string);
		});

		if (runIndex > 0) data.previous_text = texts[runIndex - 1];
		if (runIndex < texts.length - 1) data.next_text = texts[runIndex + 1];
	}

	requestOptions.body = data;

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
