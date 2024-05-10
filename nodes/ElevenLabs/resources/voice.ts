import {
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	IN8nHttpFullResponse,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';

export const VoiceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['voice'],
			},
		},
		options: [
			{
				name: 'List Voices',
				value: 'list-voices',
				action: 'List voices',
				description: 'Returns a list of the voices from the user library',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/voices"}}',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'voices',
								},
							},
							{
								type: 'filter',
								enabled: '={{!$parameter["includePremade"]}}',
								properties: {
									pass: '={{$responseItem.category!=="premade"}}',
								},
							},
							{
								type: 'setKeyValue',
								enabled: '={{$parameter["simplify"]}}',
								properties: {
									voice_id: '={{$responseItem.voice_id}}',
									name: '={{$responseItem.name}}',
									accent: '={{$responseItem.labels.accent}}',
									description: '={{$responseItem.labels.description}}',
									age: '={{$responseItem.labels.age}}',
									gender: '={{$responseItem.labels.gender}}',
									use_case: '={{$responseItem.labels["use case"]}}',
									high_quality_base_model_ids: '={{$responseItem.high_quality_base_model_ids}}',
								},
							},
						],
					},
				},
			},
			{
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
							accent_strength: `={{$parameter["additionalFields"]["accent_strength"] || 1}}`,
							text: `={{$parameter["additionalFields"]["text"] || "Digital Wisdom is the subtle art of cutting through bullshit tasks so we can focus on what truly matters and bring value to the world." }}`,
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
										accent_strength: this.getNodeParameter('additionalFields.accent_strength', 1),
									},
								}));
							},
						],
					},
				},
			},
			{
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
							voice_description:
								'={{$parameter["additionalFields"]["description"] || "Generated with n8n"}}',
							labels: '={{JSON.parse($parameter["additionalFields"]["labels"]) || {} }}',
							generated_voice_id: '={{$parameter["generated_voice_id"]}}',
						},
					},
				},
			},
			{
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
											'Generated with n8n',
										) as string,
										labels: JSON.parse(
											this.getNodeParameter('additionalFields.labels', '{}') as string,
										),
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
			},
			{
				name: 'Get Voice Details',
				value: 'get-voice-details',
				action: 'Get voice details',
				description: 'Returns all the details about one voice',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/voices/"  + $parameter["voice_id"] }}',
						qs: {
							with_settings: '={{$parameter["with_settings"]}}',
						},
					},
				},
			},
			{
				name: 'Delete Voice',
				value: 'delete-voice',
				action: 'Delete voice',
				description: 'Delete a voice from your library',
				routing: {
					request: {
						url: '={{"/voices/" + $parameter["voice_id"]}}',
						method: 'DELETE',
					},
				},
			},
		],
		default: 'list-voices',
	},

	// Parameters
	{
		displayName: 'With Settings',
		name: 'with_settings',
		type: 'boolean',
		default: false,
		description: 'Whether returns voice settings',
		displayOptions: {
			show: {
				operation: ['get-voice-details'],
			},
		},
	},
	// Notice
	{
		displayName:
			'This generates a voice and returns a generated_voice_id with an audio sample. If you like the generated voice call "Create Voice" with the generated_voice_id to create the voice.',
		name: 'notice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				operation: ['generate-voice'],
			},
		},
	},
	// Gender
	{
		displayName: 'Gender Name or ID',
		description:
			'The gender of the speaker. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		required: true,
		name: 'gender',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'listVoiceGenders',
		},
		default: '',
		displayOptions: {
			show: {
				operation: ['generate-voice'],
			},
		},
	},
	// Accent
	{
		displayName: 'Accent Name or ID',
		description:
			'The accent of the speaker. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		required: true,
		name: 'accent',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'listVoiceAccents',
		},
		default: '',
		displayOptions: {
			show: {
				operation: ['generate-voice'],
			},
		},
	},
	// Age
	{
		displayName: 'Age Name or ID',
		description:
			'The age of the speaker. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
		required: true,
		name: 'age',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'listVoiceAges',
		},
		default: '',
		displayOptions: {
			show: {
				operation: ['generate-voice'],
			},
		},
	},
	/* Additional fields */
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		default: {},
		placeholder: 'Add Fields',
		displayOptions: {
			show: {
				operation: ['generate-voice'],
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
			// Text
			{
				displayName: 'Sample Text',
				description: 'Sample text to use for voice generation',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: `This generates a voice and returns a generated_voice_id with an audio sample. If you like the generated voice call "Create Voice" with the generated_voice_id to create the voice.`,
			},
			// Accent Strength
			{
				displayName: 'Accent Strength',
				required: true,
				name: 'accent_strength',
				type: 'number',
				default: 1,
				typeOptions: {
					maxValue: 2,
					minValue: 0.3,
					numberStepSize: 0.01,
				},
			},
		],
	},
	// Create voice parameters
	// Notice
	{
		displayName:
			'This creates a voice from a generated_voice_id, generated with the "Generate Voice" operation, and adds it to your library',
		name: 'notice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				operation: ['create-voice'],
			},
		},
	},
	// Generated voice ID
	{
		displayName: 'Generation Voice ID',
		description: 'The generated_voice_id of the generated voice',
		required: true,
		name: 'generated_voice_id',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['create-voice', 'get-voice-details'],
			},
		},
	},
	{
		displayName: 'Voice ID',
		description: 'The voice you want to use',
		name: 'voice_id',
		type: 'resourceLocator',
		default: { mode: 'list', value: null },
		displayOptions: {
			show: {
				operation: ['delete-voice'],
			},
		},
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
		required: true,
	},
	{
		displayName: 'Name',
		description: 'Voice name',
		name: 'name',
		type: 'string',
		default: `n8n voice`,
		displayOptions: {
			show: {
				operation: ['create-voice', 'clone-voice'],
			},
		},
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
				operation: ['create-voice', 'clone-voice'],
			},
		},
		options: [
			// Description
			{
				displayName: 'Description',
				description: 'Voice description',
				name: 'description',
				type: 'string',
				default: `Generate with n8n`,
			},
			// Labels
			{
				displayName: 'Labels (JSON)',
				description: 'Labels to describe this voice (max 5)',
				name: 'labels',
				type: 'json',
				default: `{
	"language": "en",
	"descriptive": "custom voice",
	"generated": "with n8n"
}`,
			},
		],
	},

	{
		displayName: 'Simplify Output',
		name: 'simplify',
		type: 'boolean',
		default: true,
		description: 'Whether to return a simplified version of the response',
		displayOptions: {
			show: {
				operation: ['list-voices'],
			},
		},
	},
	{
		displayName: 'Include Premade',
		name: 'includePremade',
		type: 'boolean',
		default: false,
		description: 'Whether to include premade voices in the response',
		displayOptions: {
			show: {
				operation: ['list-voices'],
			},
		},
	},
];

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
		'Generated with n8n',
	) as string;
	const labels = this.getNodeParameter('additionalFields.labels', '{}') as string;

	formData.append('name', name);
	formData.append('description', description);
	formData.append('labels', labels);
	formData.append('files', new Blob([audioBuffer]));

	requestOptions.body = formData;

	return requestOptions;
}
