import { OpenAPIV3 } from 'openapi-types';

export const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'MMS Backend API',
    version: '1.0.0',
    description: 'RESTful API for the MMS (Management Management System) Backend',
    contact: {
      name: 'API Support',
      email: 'jadabuawwad@outlook.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000/api/v1',
      description: 'Development server',
    },
    {
      url: 'https://api.example.com/api/v1',
      description: 'Production server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Health check endpoints' },
    { name: 'Users', description: 'User management endpoints' },
    { name: 'Logs', description: 'Log management endpoints' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from login endpoint',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Error message',
              },
              code: {
                type: 'string',
                example: 'ERROR_CODE',
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: 'd0b3042a-e75d-43af-97e5-b6455a11bee8',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          fullName: {
            type: 'string',
            example: 'John Doe',
          },
          userNumber: {
            type: 'string',
            example: '9971035541',
          },
          userRole: {
            type: 'string',
            enum: ['Admin', 'Teacher', 'Student', 'Doctor'],
            example: 'Student',
          },
          deviceId: {
            type: 'string',
            example: 'UP1A.231105.015',
          },
          fcmToken: {
            type: 'string',
            example: 'fcm-token-string',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          tokenType: {
            type: 'string',
            example: 'Bearer',
          },
          expiresIn: {
            type: 'number',
            example: 3600,
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password', 'deviceId', 'fcmToken'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'password123',
          },
          deviceId: {
            type: 'string',
            example: 'device-uuid',
          },
          fcmToken: {
            type: 'string',
            example: 'firebase-cloud-messaging-token',
          },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Login successful',
          },
          user: {
            $ref: '#/components/schemas/User',
          },
          token: {
            $ref: '#/components/schemas/AuthTokens',
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName', 'deviceId', 'fcmToken'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'password123',
          },
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          userNumber: {
            type: 'string',
            example: '9971035541',
          },
          userRole: {
            type: 'string',
            enum: ['Admin', 'Teacher', 'Student', 'Doctor'],
            example: 'Student',
          },
          deviceId: {
            type: 'string',
            example: 'device-uuid',
          },
          fcmToken: {
            type: 'string',
            example: 'firebase-cloud-messaging-token',
          },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
          },
          password: {
            type: 'string',
            format: 'password',
          },
          firstName: {
            type: 'string',
          },
          lastName: {
            type: 'string',
          },
          userNumber: {
            type: 'string',
          },
          userRole: {
            type: 'string',
            enum: ['Admin', 'Teacher', 'Student', 'Doctor'],
          },
        },
      },
      Log: {
        type: 'object',
        properties: {
          log: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              actionType: {
                type: 'string',
                enum: ['in', 'out', 'break', 'leave', 'smoke break'],
              },
              description: {
                type: 'string',
              },
              time: {
                type: 'string',
                format: 'date-time',
              },
              isArchived: {
                type: 'boolean',
              },
              user: {
                $ref: '#/components/schemas/User',
              },
            },
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation successful',
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Check if the API is running',
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    message: {
                      type: 'string',
                      example: 'API is running',
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/users/login': {
      post: {
        tags: ['Users'],
        summary: 'Login user',
        description: 'Authenticate a user and receive access tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse',
                },
              },
            },
          },
          '400': {
            description: 'Bad request - missing required fields',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/users/register': {
      post: {
        tags: ['Users'],
        summary: 'Register new user',
        description: 'Create a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse',
                },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/users/refresh-token': {
      post: {
        tags: ['Users'],
        summary: 'Refresh access token',
        description: 'Get a new access token using a refresh token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token'],
                properties: {
                  token: {
                    type: 'string',
                    example: 'refresh-token',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Token refreshed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthTokens',
                },
              },
            },
          },
          '401': {
            description: 'Invalid or expired refresh token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user',
        description: 'Get the currently authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    user: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Get all users',
        description: 'Retrieve a list of all users',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    users: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/User',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/users/students': {
      get: {
        tags: ['Users'],
        summary: 'Get all students',
        description: 'Retrieve a list of all students',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Students retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    users: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/User',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        description: 'Retrieve a specific user by their ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
            description: 'User ID',
          },
        ],
        responses: {
          '200': {
            description: 'User retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    user: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user',
        description: 'Update a user by their ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
            description: 'User ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateUserRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    user: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/users/token/{token}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by token',
        description: 'Retrieve a user by their JWT token',
        parameters: [
          {
            name: 'token',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'JWT token',
          },
        ],
        responses: {
          '200': {
            description: 'User retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    user: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/users/courses/{courseId}/activities/{activityId}/students': {
      get: {
        tags: ['Users'],
        summary: 'Get students in course activity',
        description: 'Retrieve all students enrolled in a specific course activity',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
            description: 'Course ID',
          },
          {
            name: 'activityId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
            description: 'Activity ID',
          },
        ],
        responses: {
          '200': {
            description: 'Students retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    users: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/User',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/users/activities/{activityId}/students/{userId}': {
      get: {
        tags: ['Users'],
        summary: 'Get student in course activity',
        description: 'Retrieve a specific student in a course activity',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'activityId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
            description: 'Activity ID',
          },
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
            description: 'User ID',
          },
        ],
        responses: {
          '200': {
            description: 'Student retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    user: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/logs': {
      get: {
        tags: ['Logs'],
        summary: 'Get all logs',
        description: 'Retrieve a list of all logs',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Logs retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    logs: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Log',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
  },
};


