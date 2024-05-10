import { INodeProperties } from 'n8n-workflow';

export const UserOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		options: [
			{
				name: 'Get User Info',
				value: 'get-user-info',
				action: 'Get user info',
				description: 'Returns information about the active user',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/user"}}',
					},
				},
			},
			{
				name: 'Get User Subscription',
				value: 'get-user-subscription',
				action: 'Get subscription',
				description: 'Returns extended information about the users subscription',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/user/subscription"}}',
					},
				},
			},
		],
		default: 'get-user-info',
	},
];
