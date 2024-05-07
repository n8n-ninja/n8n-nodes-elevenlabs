import { INodePropertyOptions } from 'n8n-workflow';

/* Operation */
export const getUserInfoOperation: INodePropertyOptions = {
	name: 'Get User Info',
	value: 'get-user-info',
	action: 'Returns user information',
	description: 'Gets information about the user',
	routing: {
		request: {
			method: 'GET',
			url: '={{"/user"}}',
		},
	},
};
