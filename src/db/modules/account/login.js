const Account = require("../../models/account");
const checkPassword = require("../password/check");
const jwt = require("jsonwebtoken");
require("dotenv").config("../../../.env");

async function getAccountByUsername(username) {
	return await Account.findOne({
		username,
	});
}

async function getAccountByEmail(email) {
	return await Account.findOne({
		"email.address": email,
	});
}

module.exports = async ({ username, password }) => {
	let errors = [];

	if (!username) errors.username = "username was not provided";
	if (!password) errors.password = "password was not provided";

	if (Object.keys(errors).length !== 0)
		return [
			null,
			{
				message: Object.values(errors).join("\n"),
				code: 400,
			},
		];

	// Username can also be an email
	const account = (await getAccountByUsername(username)) || (await getAccountByEmail(username));
	if (!account)
		return [
			null,
			{
				message: "Invalid username or password",
				code: 403,
			},
		];
	const passwordIsCorrect = checkPassword(password, account?.password);
	if (!passwordIsCorrect)
		return [
			null,
			{
				message: "Invalid username or password",
				code: 403,
			},
		];

	const token = jwt.sign(
		{
			id: account.id,
		},
		process.env.JWT_KEY,
		{
			algorithm: "HS256",
			expiresIn: "7d",
		}
	);

	return [
		{
			token,
		},
		null,
	];
};