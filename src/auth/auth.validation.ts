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

export type SignupFieldErrors = {
	email: string[];
	password: string[];
	confirmPassword: string[];
};

export type LoginFieldErrors = {
	email: string[];
	password: string[];
};

export function emptySignupFieldErrors(): SignupFieldErrors {
	return { email: [], password: [], confirmPassword: [] };
}

export function emptyLoginFieldErrors(): LoginFieldErrors {
	return { email: [], password: [] };
}

export function flattenSignupFieldErrors(fieldErrors: SignupFieldErrors): string[] {
	return [...fieldErrors.email, ...fieldErrors.password, ...fieldErrors.confirmPassword];
}

export function flattenLoginFieldErrors(fieldErrors: LoginFieldErrors): string[] {
	return [...fieldErrors.email, ...fieldErrors.password];
}

type SignupValidationResult =
	| { ok: true; value: SignupInput }
	| { ok: false; fieldErrors: SignupFieldErrors; value: SignupFormValue };

type LoginValidationResult =
	| { ok: true; value: LoginInput }
	| { ok: false; fieldErrors: LoginFieldErrors; value: LoginFormValue };

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

function validateEmail(email: string, emailErrors: string[]): string {
	const normalizedEmail = normalizeEmail(email);

	if (normalizedEmail === '') {
		emailErrors.push(AUTH_VALIDATION_MESSAGES.emailRequired);
		return normalizedEmail;
	}

	if (normalizedEmail.length > MAX_USER_EMAIL_LENGTH) {
		emailErrors.push(AUTH_VALIDATION_MESSAGES.emailTooLong);
	}

	if (!BASIC_EMAIL_PATTERN.test(normalizedEmail)) {
		emailErrors.push(AUTH_VALIDATION_MESSAGES.emailInvalid);
	}

	return normalizedEmail;
}

function validateSignupPassword(password: string, passwordErrors: string[]): void {
	if (password === '') {
		passwordErrors.push(AUTH_VALIDATION_MESSAGES.passwordRequired);
		return;
	}

	if (password.length < MIN_PASSWORD_LENGTH) {
		passwordErrors.push(AUTH_VALIDATION_MESSAGES.passwordTooShort);
	}

	if (password.length > MAX_PASSWORD_LENGTH) {
		passwordErrors.push(AUTH_VALIDATION_MESSAGES.passwordTooLong);
	}
}

function validateLoginPassword(password: string, passwordErrors: string[]): void {
	if (password === '') {
		passwordErrors.push(AUTH_VALIDATION_MESSAGES.passwordRequired);
		return;
	}

	if (password.length > MAX_PASSWORD_LENGTH) {
		passwordErrors.push(AUTH_VALIDATION_MESSAGES.passwordTooLong);
	}
}

export function validateSignupInput(
	email: string,
	password: string,
	confirmPassword: string
): SignupValidationResult {
	const fieldErrors = emptySignupFieldErrors();
	const normalizedEmail = validateEmail(email, fieldErrors.email);

	validateSignupPassword(password, fieldErrors.password);

	if (confirmPassword === '') {
		fieldErrors.confirmPassword.push(AUTH_VALIDATION_MESSAGES.confirmPasswordRequired);
	} else if (password !== confirmPassword) {
		fieldErrors.confirmPassword.push(AUTH_VALIDATION_MESSAGES.passwordMismatch);
	}

	const hasErrors =
		fieldErrors.email.length > 0 ||
		fieldErrors.password.length > 0 ||
		fieldErrors.confirmPassword.length > 0;

	if (hasErrors) {
		return {
			ok: false,
			fieldErrors,
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
	const fieldErrors = emptyLoginFieldErrors();
	const normalizedEmail = validateEmail(email, fieldErrors.email);

	validateLoginPassword(password, fieldErrors.password);

	if (fieldErrors.email.length > 0 || fieldErrors.password.length > 0) {
		return {
			ok: false,
			fieldErrors,
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
