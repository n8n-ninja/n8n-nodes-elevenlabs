import { INodeProperties } from 'n8n-workflow';
import { getUserInfoOperation } from './operation.getUserInfo';
import { getUserSubscriptionOperation } from './operation.getUserSubscription';

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
		options: [getUserInfoOperation, getUserSubscriptionOperation],
		default: '',
	},
];
