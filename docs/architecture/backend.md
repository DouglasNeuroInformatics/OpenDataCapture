## Introduction

The backend architecture of the web application is built using NestJS, a framework for building efficient and scalable server-side applications. For a quick introduction to NestJS, we recommend [this video](https://www.youtube.com/watch?v=0M8AYU_hPas).

## Dependency Injection

NestJS leverages dependency injection (DI) to manage the dependencies of the different parts of the application. DI is a design pattern that allows the application to be more loosely coupled, making it easier to test and maintain.

In NestJS, when a class is decorated with the @Injectable() decorator, it is eligible to be injected as a dependency. These classes are typically services or providers that encapsulate specific functionality of the application. The classes that depend on these services or providers, such as controllers or pipes, can then have them injected into their constructors. For example:

When the NestJS application is bootstrapped, it scans for all the classes decorated with @Injectable() and creates instances of them. These instances are then stored in a container, which is responsible for managing the lifecycle of the instances and providing them when they are needed by other parts of the application.

By using DI, NestJS allows for a separation of concerns and encapsulation of functionality, making the application more maintainable and testable. The application becomes more flexible, as it is easy to replace dependencies with mock or mock-like objects in test environments. Also, it is easier to manage the lifecycle of the services and providers, which makes it easy to handle resources such as database connections.

## Built-In Features

NestJS provides several built-in features that are leveraged in the application, including:
- A validation pipe, which is used to validate the request body before passing it to the corresponding controller method. This helps to ensure that the data received by the backend is consistent and in the expected format.
- An exception filter, which is implemented to handle any exceptions that may occur during the request-response cycle. This provides a consistent error response to the client, making it easier to handle and debug errors on the client-side.
- A guard, which is used to handle the authorization and authentication of the application. It is used to restrict access to certain routes or controllers based on the user's roles or permissions. This ensures that only authorized users can access the protected routes or controllers.

## Modular Structure

NestJS organizes all of the controllers, services, pipes, guards, and filters in a modular structure, making it easy to maintain and test the application.

Controllers handle the incoming HTTP requests, and are responsible for handling the request, validating the inputs, and returning a response. They are decorated with the @Controller decorator, and the routes are defined using the @Get, @Post, @Put, etc decorators.

Services are used to encapsulate the business logic of the application, and can be used by multiple controllers. They are decorated with the @Injectable() decorator and are typically injected into controllers via the constructor.

## Database

The database is accessed via repository classes, which inherit from the abstract EntityRepository class. This allows us to define the generic type parameters of the repository and obtain type safety. This pattern allows for a separation of concerns and encapsulation of database logic, making the application more maintainable and testable.

In addition to the technologies mentioned above, the web application also uses Mongoose for its database. Mongoose is an Object Data Modeling (ODM) library for MongoDB, a document-based database. MongoDB stores data in a collection of documents, where each document is a set of key-value pairs. This allows for more flexible and dynamic data modeling compared to traditional, table-based databases.

The application uses Mongoose to define the schemas for the documents that are stored in the MongoDB database. The schemas are defined using strict mode, which means that any properties not defined in the schema will not be allowed to be saved in the database. This helps to ensure that the data in the database is consistent and in the expected format.

## OpenAPI

NestJS swagger is a module that allows for the integration of the OpenAPI specification (formerly known as Swagger) into a NestJS application. This allows for the automatic generation of an API documentation in the form of an openapi.json file. The openapi.json file can then be used to generate an interactive API documentation, which can be easily consumed by developers and stakeholders.

In this application, NestJS swagger is used to generate an openapi spec, but instead of the default swagger interface, the application is using redoc. Redoc is an open-source tool that allows for the creation of beautiful and interactive API documentation. This is implemented in the docs module using the NestJS serve static module, which allows for the serving of static files from a given folder. This way the redoc interface can be accessed by visiting the default endpoint on the server (e.g., localhost 5500)

## Entry Point

The main entry point to the application is the main.ts file, where the application is bootstrapped using NestJS. During the bootstrapping process, Cross-Origin Resource Sharing (CORS) is enabled to allow for communication between the frontend and backend. This is done to ensure that the browser does not block requests from the frontend to the backend due to security reasons.