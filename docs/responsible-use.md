# Responsible use

This project documents observed behavior; it does not grant authorization.

- Use only accounts and data you own or are explicitly authorized to access.
- Do not bypass technical restrictions, authentication, authorization, subscription controls, certificate checks, or service safety controls.
- Do not access another person's account or share credentials.
- Do not dump catalogs or redistribute recipe text, instructions, images, video, or substantial response datasets.
- Do not use the interface to create trial accounts, automate account sharing, or commercially exploit Cookidoo content.
- Keep any client rate conservative, bound concurrency, back off on failures, and respect `429` or other retry signals.
- Treat every mutation as deliberate. Deletion, public sharing, ratings, and device operations deserve separate user confirmation.
- Prefer operations on user-created, private, account-owned data.
- Use the account's actual region and record the market and observation date.

The generated API reference is static and provides no request execution
control. The repository's own checks make no service requests.

Potential authentication bypasses, cross-account access, exposed credentials,
or similar security findings should be withheld from public issues and handled
through the service owner's private disclosure process described in
[`SECURITY.md`](../SECURITY.md).
