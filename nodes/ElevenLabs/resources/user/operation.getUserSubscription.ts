import { INodePropertyOptions } from 'n8n-workflow';

/* Operation */
export const getUserSubscriptionOperation: INodePropertyOptions = {
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
};
