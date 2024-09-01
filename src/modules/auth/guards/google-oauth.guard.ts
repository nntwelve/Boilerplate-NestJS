import { AuthGuard } from '@nestjs/passport';

export class GoogleAuthGuard extends AuthGuard('google') {
	// constructor() {
	//   super({
	//     accessType: 'offline',
	//   });
	// }
}
