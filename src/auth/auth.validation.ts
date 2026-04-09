import {
	MAX_PASSWORD_LENGTH,
	MAX_USER_EMAIL_LENGTH,
	MIN_PASSWORD_LENGTH,
} from '../config/constants.js';

const AUTH_VALIDATION_MESSAGES = {
	emailRequired: 'Email is required.',
	emailInvalid: 'Enter a valid email address.',
	emailTooLong: `Email must be ${MAX_USER_EMAIL_LENGTH} characters or fewer.`,
	passwordRequired: 'Password is required.',
	passwordTooShort: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
	passwordTooLong: `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.`,
	confirmPasswordRequired: 'Please confirm your password.',
	passwordMismatch: 'Passwords must match.',
} as const;

const BASIC_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignupInput = {
	email: string;
	password: string;
};

export type SignupFormValue = {
	email: string;
	password: string;
	confirmPassword: string;
};

export type LoginInput = {
	email: string;
	password: string;
};

export type LoginFormValue = {
	email: string;
	password: string;
};

type SignupValidationResult =
	| { ok: true; value: SignupInput }
	| { ok: false; errors: string[]; value: SignupFormValue };

type LoginValidationResult =
	| { ok: true; value: LoginInput }
	| { ok: false; errors: string[]; value: LoginFormValue };

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

function getSafeSignupFormValue(email: string): SignupFormValue {
	return {
		email: normalizeEmail(email),
		password: '',
		confirmPassword: '',
	};
}

function getSafeLoginFormValue(email: string): LoginFormValue {
	return {
		email: normalizeEmail(email),
		password: '',
	};
}

function validateEmail(email: string, errors: string[]): string {
	const normalizedEmail = normalizeEmail(email);

	if (normalizedEmail === '') {
		errors.push(AUTH_VALIDATION_MESSAGES.emailRequired);
		return normalizedEmail;
	}

	if (normalizedEmail.length > MAX_USER_EMAIL_LENGTH) {
		errors.push(AUTH_VALIDATION_MESSAGES.emailTooLong);
	}

	if (!BASIC_EMAIL_PATTERN.test(normalizedEmail)) {
		errors.push(AUTH_VALIDATION_MESSAGES.emailInvalid);
	}

	return normalizedEmail;
}

function validateSignupPassword(password: string, errors: string[]): void {
	if (password === '') {
		errors.push(AUTH_VALIDATION_MESSAGES.passwordRequired);
		return;
	}

	if (password.length < MIN_PASSWORD_LENGTH) {
		errors.push(AUTH_VALIDATION_MESSAGES.passwordTooShort);
	}

	if (password.length > MAX_PASSWORD_LENGTH) {
		errors.push(AUTH_VALIDATION_MESSAGES.passwordTooLong);
	}
}

function validateLoginPassword(password: string, errors: string[]): void {
	if (password === '') {
		errors.push(AUTH_VALIDATION_MESSAGES.passwordRequired);
		return;
	}

	if (password.length > MAX_PASSWORD_LENGTH) {
		errors.push(AUTH_VALIDATION_MESSAGES.passwordTooLong);
	}
}

export function validateSignupInput(
	email: string,
	password: string,
	confirmPassword: string
): SignupValidationResult {
	const errors: string[] = [];
	const normalizedEmail = validateEmail(email, errors);

	validateSignupPassword(password, errors);

	if (confirmPassword === '') {
		errors.push(AUTH_VALIDATION_MESSAGES.confirmPasswordRequired);
	} else if (password !== confirmPassword) {
		errors.push(AUTH_VALIDATION_MESSAGES.passwordMismatch);
	}

	if (errors.length > 0) {
		return {
			ok: false,
			errors,
			value: getSafeSignupFormValue(email),
		};
	}

	return {
		ok: true,
		value: {
			email: normalizedEmail,
			password,
		},
	};
}

export function validateLoginInput(
	email: string,
	password: string
): LoginValidationResult {
	const errors: string[] = [];
	const normalizedEmail = validateEmail(email, errors);

	validateLoginPassword(password, errors);

	if (errors.length > 0) {
		return {
			ok: false,
			errors,
			value: getSafeLoginFormValue(email),
		};
	}

	return {
		ok: true,
		value: {
			email: normalizedEmail,
			password,
		},
	};
}