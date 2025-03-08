import {
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	IN8nHttpFullResponse,
	INodeExecutionData,
	INodeProperties,
	IDataObject,
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
				action: 'Text to Speech',
				description: 'Generate a speech from a text',
				routing: {
					send: {
						preSend: [preSendText],
					},
				},
			},
			{
				name: 'Voice changer',
				value: 'voice-changer',
				action: 'Voice changer',
				description: 'Transform audio from one voice to another',
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
					enable_logging: '={{$parameter["additionalFields"]["enable_logging"]}}',
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
	
	// Audio Input for Voice Changer
	{
		displayName: 'Binary Input Field',
		name: 'binaryInputField',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property that contains the audio file to transform',
		displayOptions: {
			show: {
				operation: ['voice-changer'],
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
				description: 'Turn on latency optimizations at some cost of quality. Values: 0 (default - no optimizations), 1 (normal - 50% improvement), 2 (strong - 75% improvement), 3 (max), 4 (max with text normalizer off)',
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
				type: 'options',
				options: [
					{ name: 'MP3 (44.1kHz, 128kbps)', value: 'mp3_44100_128' },
					{ name: 'MP3 (44.1kHz, 192kbps)', value: 'mp3_44100_192' },
					{ name: 'PCM (16-bit, 44.1kHz)', value: 'pcm_16000' },
					{ name: 'PCM (16-bit, 22.05kHz)', value: 'pcm_22050' },
					{ name: 'PCM (16-bit, 24kHz)', value: 'pcm_24000' },
					{ name: 'PCM (24-bit, 44.1kHz)', value: 'pcm_24000_24' },
					{ name: 'μ-law (8-bit, 8kHz)', value: 'ulaw_8000' },
				],
				default: 'mp3_44100_128',
			},
			// language_code - New parameter from documentation
			{
				displayName: 'Language Code',
				description: 'Language code (ISO 639-1) used to enforce a language for the model. Currently only works with Turbo v2.5 and Flash v2.5',
				name: 'language_code',
				type: 'string',
				default: '',
				placeholder: 'en',
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
				default: 'eleven_multilingual_v2',
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
				description: 'Makes TTS deterministic. Providing the same seed with the same text will result in the same audio output. Values between 0-4294967295',
				name: 'seed',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 0,
					maxValue: 4294967295,
				},
			},
			// Enable Logging (new parameter)
			{
				displayName: 'Enable Logging',
				description: 'Whether to enable logging. False means zero retention mode (history features unavailable)',
				name: 'enable_logging',
				type: 'boolean',
				default: true,
			},
			// Text Normalization (new parameter)
			{
				displayName: 'Text Normalization',
				description: 'Controls text normalization. Auto (system decides), On (always applied), Off (skipped)',
				name: 'apply_text_normalization',
				type: 'options',
				options: [
					{ name: 'Auto', value: 'auto' },
					{ name: 'On', value: 'on' },
					{ name: 'Off', value: 'off' },
				],
				default: 'auto',
			},
			// Use PVC as IVC (new parameter)
			{
				displayName: 'Use PVC as IVC',
				description: 'If true, won\'t use PVC version of the voice for generation but the IVC version',
				name: 'use_pvc_as_ivc',
				type: 'boolean',
				default: false,
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
			// Previous Request IDs (new)
			{
				displayName: 'Previous Request IDs',
				description: 'A list of request_ids of samples generated before this generation (max 3)',
				name: 'previous_request_ids',
				type: 'string',
				default: '',
				placeholder: 'id1,id2,id3',
				displayOptions: {
					show: {
						stitching: [true],
					},
				},
			},
			// Next Request IDs (new)
			{
				displayName: 'Next Request IDs',
				description: 'A list of request_ids of samples that come after this generation (max 3)',
				name: 'next_request_ids',
				type: 'string',
				default: '',
				placeholder: 'id1,id2,id3',
				displayOptions: {
					show: {
						stitching: [true],
					},
				},
			},
			// Remove Background Noise (voice-changer specific)
			{
				displayName: 'Remove Background Noise',
				description: 'Whether to remove background noise from the audio input',
				name: 'remove_background_noise',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						'/operation': ['voice-changer'],
					},
				},
			},
		],
	},
];

async function preSendUploadAudio(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const binaryInputField = this.getNodeParameter('binaryInputField', 'data') as string;
	const additionalFields = this.getNodeParameter('additionalFields', {}) as IDataObject;
	
	// Get binary data
	const audioBuffer = await this.helpers.getBinaryDataBuffer(binaryInputField);
	
	// Create form data
	const formData = new FormData();
	formData.append('audio', new Blob([audioBuffer]));
	
	// Add model_id if provided
	if (additionalFields.model_id) {
		formData.append('model_id', additionalFields.model_id as string);
	}
	
	// Add seed if provided and not 0
	if (additionalFields.seed && (additionalFields.seed as number) !== 0) {
		formData.append('seed', additionalFields.seed as string);
	}
	
	// Add remove_background_noise if provided
	if (additionalFields.remove_background_noise !== undefined) {
		formData.append('remove_background_noise', String(additionalFields.remove_background_noise));
	}
	
	// Handle voice settings
	// Create voice settings from individual parameters
	const voiceSettings = {
		stability: additionalFields.stability || 0.5,
		similarity_boost: additionalFields.similarity_boost || 0.75,
		style: additionalFields.style || 0,
		use_speaker_boost: additionalFields.use_speaker_boost || false,
	};
	
	formData.append('voice_settings', JSON.stringify(voiceSettings));
	
	// Add query parameters
	if (additionalFields.enable_logging !== undefined) {
		requestOptions.qs = {
			...requestOptions.qs,
			enable_logging: additionalFields.enable_logging,
		};
	}
	
	// Add output format if provided
	if (additionalFields.output_format) {
		requestOptions.qs = {
			...requestOptions.qs,
			output_format: additionalFields.output_format,
		};
	}
	
	// Add streaming latency if provided
	if (additionalFields.optimize_streaming_latency !== undefined) {
		requestOptions.qs = {
			...requestOptions.qs,
			optimize_streaming_latency: additionalFields.optimize_streaming_latency,
		};
	}
	
	requestOptions.body = formData;
	return requestOptions;
}

async function preSendText(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const text = this.getNodeParameter('text') as string;
	const additionalFields = this.getNodeParameter('additionalFields', {}) as IDataObject;

	// Get all the parameters
	const model_id = additionalFields.model_id as string || 'eleven_multilingual_v2';
	const seed = parseInt(additionalFields.seed as string || '0', 10);
	const language_code = additionalFields.language_code as string;
	const enable_logging = additionalFields.enable_logging as boolean;
	const apply_text_normalization = additionalFields.apply_text_normalization as string;
	const use_pvc_as_ivc = additionalFields.use_pvc_as_ivc as boolean;
	const stitching = additionalFields.stitching as boolean;

	// Voice settings
	const stability = additionalFields.stability as number || 0.5;
	const similarity_boost = additionalFields.similarity_boost as number || 0.75;
	const style = additionalFields.style as number || 0;
	const use_speaker_boost = additionalFields.use_speaker_boost as boolean;

	// Build the request body
	const data: IDataObject = {
		text,
		model_id,
		voice_settings: {
			stability,
			similarity_boost,
			style,
			use_speaker_boost,
		},
	};

	// Add optional parameters
	if (language_code) data.language_code = language_code;
	if (seed !== 0) data.seed = seed;
	if (enable_logging !== undefined) requestOptions.qs = {...requestOptions.qs, enable_logging};
	if (apply_text_normalization) data.apply_text_normalization = apply_text_normalization;
	if (use_pvc_as_ivc !== undefined) data.use_pvc_as_ivc = use_pvc_as_ivc;

	// Handle stitching
	if (stitching) {
		const runIndex = this.getItemIndex();
		const texts: string[] = [];

		this.getExecuteData().data.main[0]?.forEach((item) => {
			texts.push(item.json.text as string);
		});

		// Add previous and next text for context
		if (runIndex > 0) data.previous_text = texts[runIndex - 1];
		if (runIndex < texts.length - 1) data.next_text = texts[runIndex + 1];

		// Handle request IDs
		const previousRequestIds = (additionalFields.previous_request_ids as string || '').split(',').filter(Boolean);
		const nextRequestIds = (additionalFields.next_request_ids as string || '').split(',').filter(Boolean);

		if (previousRequestIds.length > 0) {
			data.previous_request_ids = previousRequestIds.slice(0, 3); // Max 3 IDs allowed
		}

		if (nextRequestIds.length > 0) {
			data.next_request_ids = nextRequestIds.slice(0, 3); // Max 3 IDs allowed
		}
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
