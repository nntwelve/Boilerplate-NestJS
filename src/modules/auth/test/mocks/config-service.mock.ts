export const mockConfigService = {
	get(key: string) {
		switch (key) {
			case 'JWT_ACCESS_TOKEN_EXPIRATION_TIME':
				return '3601';
			case 'JWT_REFRESH_TOKEN_EXPIRATION_TIME':
				return '36000';
		}
	},
};
