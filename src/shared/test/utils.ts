import { CanActivate } from '@nestjs/common';

/**
 * Checks whether a route or a Controller is protected with the specified Guard.
 * @param route is the route or Controller to be checked for the Guard.
 * @param guard_type is the type of the Guard, e.g. JwtAuthGuard.
 * @returns true if the specified Guard is applied.
 */
export function isGuarded(
	route: ((...args: any[]) => any) | (new (...args: any[]) => unknown),
	guard_type: new (...args: any[]) => CanActivate,
) {
	const guards: any[] = Reflect.getMetadata('__guards__', route);

	if (!guards) {
		throw Error(
			`Expected: ${route.name} to be protected with ${guard_type.name}\nReceived: No guard`,
		);
	}

	let found_guard = false;
	const guard_list: string[] = [];
	guards.forEach((guard) => {
		guard_list.push(guard.name);
		if (guard.name === guard_type.name) found_guard = true;
	});

	if (!found_guard) {
		throw Error(
			`Expected: ${route.name} to be protected with ${guard_type.name}\nReceived: only ${guard_list}`,
		);
	}
	return true;
}
