import { INodePropertyOptions } from 'n8n-workflow';

/* Operation */
export const getUserSubscriptionOperation: INodePropertyOptions = {
	name: 'Get User Subscription',
	value: 'get-user-subscription',
	action: 'Returns user subscription',
	description: 'Gets extended information about the users subscription',
	routing: {
		request: {
			method: 'GET',
			url: '={{"/user/subscription"}}',
		},
	},
};
