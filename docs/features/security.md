# Security

## Background

The Douglas Data Capture Platform is designed to be secure by design. Here, we provide a detailed overview of all major aspects of our security system, including authentication and authorization.

The following sections were primarily created for future developers and system administrators. While there may be some short code snippets and commands referenced throughout, they are not crucial for understanding the fundamental principles that underpin our security system. Therefore, these sections are also suitable for non-technical users who are interested in learning about our security system.

This documentation pertains to the access of resources from an arbitrary client. The implementation of these protocols in our web client is not discussed here. The focus of this documentation is solely on the security of the platform, and any technical details that are not essential to this end are excluded.

## Assumptions

This security model is based on protecting the database from unauthorized users through network-based attacks. To this end, it is assumed that:

1. The platform administrator is trusted
2. The server is not compromised

## Risks

- Zero Day Exploit
- Known Vulnerabilities in Libraries
- Cross-Site Scripting
  - Must validate and sanitize incoming data
- Database Injection
  - Mongoose might not be vulnerable
- Exposing credentials

JWT compromised due to malware running on client. Since JWT is stored in memory in our client, this should not be an issue. However, it is possible that another programmatic client could be compromised.

## Authentication

The API uses JSON Web Tokens (JWTs) to identify and authorize users. When a client sends a request to `/auth/login`, their password is compared to a hashed and salted version stored in our database. If the password is valid, the server issues an access and refresh token. These tokens are signed using a secret key stored in the environment `SECRET_KEY`.

The validity of both tokens is time-limited: the access token is set to expire in 15 minutes, whereas the refresh token is set to expire in 24 hours.

Following [web standards](https://www.rfc-editor.org/rfc/rfc6750), the access token is attached to each request.

As [documented](https://www.rfc-editor.org/rfc/rfc6749#section-1.2), the workflow is as follows:

1. The client requests an access token by authenticating with the authorization server and presenting an authorization grant.
2. The authorization server authenticates the client and validates the authorization grant, and if valid, issues an access token and a refresh token.
3. The client makes a protected resource request to the resource server by presenting the access token.
4. The resource server validates the access token, and if valid, serves the request.
5. Steps (C) and (D) repeat until the access token expires. If the client knows the access token expired, it skips to step (G); otherwise, it makes another protected resource request.
6. Since the access token is invalid, the resource server returns an invalid token error.
## Authorization

Once a user is authenticated, attribute-based access control is used to determine access to protected resources. When creating a user, a default set of permissions _may_ be assigned based on the following roles:

1. Admin
2. Group Manager
3. Standard User

If no role is specified, then the user is created with no permissions. In this case, an admin can apply additional, custom permissions to this user.

### Admin

By default, an admin user has full access (i.e., create, read, update, and delete) to all resources. For security reasons, it is recommended to create only one admin, and elevate the privileges of group managers when required.

### Group Manager

Admin users have access to all functionality in the platform, including:

- Subject Registration
- Data Extraction
- Data Visualization
- Instrument Creation
- Administering Instruments

Users, on the other hand, may access the following functionality:

- Subject Registration
- Data Extraction\*
- Data Visualization\*
- Administering Instruments\*

> **Important Note:** For items marked with an asterisk, the specific data/instruments available to the user are determined by the clinic(s) to which they belong.

However, unlike admins, users are not permitted to access all data associated with a given feature. Rather, users are associated with one or more clinics, which determine their access permissions. _When a user affiliated with multiple clinics attempts to log into the platform, they will be prompted to select the clinic for the current session. The permissions of the user are then determined by the clinic associated with the current login session._
