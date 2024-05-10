import { INodePropertyOptions } from 'n8n-workflow';

/* Operation */
export const getUserInfoOperation: INodePropertyOptions = {
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
};
