# Security

## Background

The Douglas Data Capture Platform is designed to be secure by design. Here, we provide a detailed overview of all major aspects of our security system, including authentication and authorization.

The following sections were primarily created for future developers and system administrators. While there may be some short code snippets and commands referenced throughout, they are not crucial for understanding the fundamental principles that underpin our security system. Therefore, these sections are also suitable for non-technical users who are interested in learning about our security system.

This documentation pertains to the access of resources from an arbitrary client. The implementation of these protocols in our web client is not discussed here. The focus of this documentation is solely on the security of the platform, and any technical details that are not essential to this end are excluded.

## Assumptions

This security model is based on protecting the database from unauthorized users through network-based attacks. To this end, it is assumed that:

1. The platform administrator is trusted
2. The server is not compromised

## Authentication

The API uses JSON Web Tokens (JWTs) to identify and authorize users. When a client sends a request to `/auth/login`, their password is compared to a hashed and salted version stored in our database. If the password is valid, the server issues an access token. This token is signed using a secret key stored in the environment variable `SECRET_KEY` and set to expire in 24 hours.

Following [web standards](https://www.rfc-editor.org/rfc/rfc6750), the access token is attached to each request header in the following format: `Authorization: Bearer {TOKEN}`

## Authorization

Once a user is authenticated, [attribute-based access control](https://en.wikipedia.org/wiki/Attribute-based_access_control) is used to determine access to protected resources. When creating a user, a default set of permissions _may_ be assigned based on the following roles:

1. Admin
2. Group Manager
3. Standard User

If no role is specified, then the user is created with no permissions. In this case, an admin can apply additional, custom permissions to this user.

### Admin

By default, an admin user has full access (i.e., create, read, update, and delete) to all resources. For security reasons, it is recommended to create only one admin, and elevate the privileges of group managers when required.

### Group Manager

TBD

### Standard User

TBD
