import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Vehicle Rental Management API',
    version: '1.0.0',
    description: 'REST API for staff auth, profile management, vehicle fleet management, rental booking overlap checks, and monthly activity reports.'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT Bearer token'
      }
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', example: 'newstaff@vrm.com' },
          password: { type: 'string', example: 'Password123!' },
          name: { type: 'string', example: 'John Staff' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'admin@vrm.com' },
          password: { type: 'string', example: 'Password123!' }
        }
      },
      UpdateProfileRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'John Updated' },
          email: { type: 'string', example: 'updatedstaff@vrm.com' },
          password: { type: 'string', example: 'NewSecret123!' }
        }
      },
      StaffProfile: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', example: 'admin@vrm.com' },
          name: { type: 'string', example: 'System Administrator' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      VehicleInput: {
        type: 'object',
        required: ['name', 'plate_number', 'category', 'daily_rate'],
        properties: {
          name: { type: 'string', example: 'Tesla Model 3' },
          plate_number: { type: 'string', example: 'EV-9999' },
          category: { type: 'string', example: 'Electric' },
          daily_rate: { type: 'number', example: 100.0 },
          photo: { type: 'string', format: 'binary', description: 'Vehicle image file' }
        }
      },
      RentalInput: {
        type: 'object',
        required: ['vehicle_id', 'customer_name', 'customer_phone', 'start_date', 'end_date'],
        properties: {
          vehicle_id: { type: 'integer', example: 1 },
          customer_name: { type: 'string', example: 'John Doe' },
          customer_phone: { type: 'string', example: '+1-555-0199' },
          start_date: { type: 'string', format: 'date', example: '2026-08-15' },
          end_date: { type: 'string', format: 'date', example: '2026-08-20' },
          status: { type: 'string', enum: ['booked', 'ongoing', 'completed', 'cancelled'], example: 'booked' }
        }
      }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register new staff account',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } }
          }
        },
        responses: {
          '201': {
            description: 'Staff registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Staff registered successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
                        staff: { $ref: '#/components/schemas/StaffProfile' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': { description: 'Email already exists or validation error' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Staff Login',
        description: 'Authenticate staff user and return JWT bearer token',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login successful' },
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
                        staff: { $ref: '#/components/schemas/StaffProfile' }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': { description: 'Invalid email or password' }
        }
      }
    },
    '/auth/profile': {
      get: {
        tags: ['Auth'],
        summary: 'Get current staff profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Staff profile retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Staff profile retrieved successfully' },
                    data: { $ref: '#/components/schemas/StaffProfile' }
                  }
                }
              }
            }
          },
          '401': { description: 'Unauthorized' }
        }
      },
      patch: {
        tags: ['Auth'],
        summary: 'Update current staff profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } }
          }
        },
        responses: {
          '200': {
            description: 'Staff profile updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Staff profile updated successfully' },
                    data: { $ref: '#/components/schemas/StaffProfile' }
                  }
                }
              }
            }
          },
          '401': { description: 'Unauthorized' }
        }
      },
      delete: {
        tags: ['Auth'],
        summary: 'Delete staff profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Staff profile deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Staff profile deleted successfully' }
                  }
                }
              }
            }
          },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/vehicles': {
      get: {
        tags: ['Vehicles'],
        summary: 'Get all vehicles',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'name', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          '200': {
            description: 'Vehicles retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Vehicles retrieved successfully' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer', example: 1 },
                          name: { type: 'string', example: 'Toyota Camry' },
                          plate_number: { type: 'string', example: 'ABC-1234' },
                          category: { type: 'string', example: 'Sedan' },
                          daily_rate: { type: 'number', example: 50.0 },
                          photo_path: { type: 'string', example: 'uploads/vehicles/vehicle-1.jpg' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Vehicles'],
        summary: 'Create a new vehicle',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/VehicleInput' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Vehicle created successfully',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } }
            }
          }
        }
      }
    },
    '/vehicles/{id}': {
      get: {
        tags: ['Vehicles'],
        summary: 'Get vehicle by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': {
            description: 'Vehicle details',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } }
            }
          },
          '404': { description: 'Vehicle not found' }
        }
      },
      put: {
        tags: ['Vehicles'],
        summary: 'Update vehicle',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/VehicleInput' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Vehicle updated',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } }
            }
          }
        }
      },
      delete: {
        tags: ['Vehicles'],
        summary: 'Soft delete vehicle',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': {
            description: 'Vehicle soft deleted',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } }
            }
          }
        }
      }
    },
    '/rentals': {
      get: {
        tags: ['Rentals'],
        summary: 'Get all rentals',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'vehicle_id', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['booked', 'ongoing', 'completed', 'cancelled'] } },
          { name: 'start_date', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'end_date', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by customer name or phone' }
        ],
        responses: {
          '200': {
            description: 'Rentals list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } }
            }
          }
        }
      },
      post: {
        tags: ['Rentals'],
        summary: 'Create rental booking',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RentalInput' } }
          }
        },
        responses: {
          '201': {
            description: 'Rental created successfully',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } }
            }
          },
          '409': {
            description: 'Vehicle already booked for overlapping dates',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } }
            }
          }
        }
      }
    },
    '/rentals/{id}': {
      get: {
        tags: ['Rentals'],
        summary: 'Get rental by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': {
            description: 'Rental details',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } }
            }
          }
        }
      },
      put: {
        tags: ['Rentals'],
        summary: 'Update rental',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RentalInput' } }
          }
        },
        responses: {
          '200': {
            description: 'Rental updated',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } }
            }
          },
          '409': { description: 'Date conflict on update' }
        }
      },
      delete: {
        tags: ['Rentals'],
        summary: 'Delete rental',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': {
            description: 'Rental deleted',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } }
            }
          }
        }
      }
    },
    '/reports/rentals': {
      get: {
        tags: ['Reports'],
        summary: 'Get monthly rental activity report',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'month', in: 'query', required: true, schema: { type: 'string', example: '2026-08' }, description: 'YYYY-MM format' },
          { name: 'vehicle_id', in: 'query', schema: { type: 'integer' } }
        ],
        responses: {
          '200': {
            description: 'Monthly report generated with prorated rental days and revenue',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Monthly rental report generated successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        month: { type: 'string', example: '2026-08' },
                        vehicles: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'integer', example: 1 },
                              name: { type: 'string', example: 'Toyota Camry' },
                              plate_number: { type: 'string', example: 'ABC-1234' },
                              category: { type: 'string', example: 'Sedan' },
                              total_bookings: { type: 'integer', example: 1 },
                              days_rented: { type: 'integer', example: 3 },
                              revenue: { type: 'number', example: 150.0 }
                            }
                          }
                        },
                        highest_revenue_vehicle: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer', example: 2 },
                            name: { type: 'string', example: 'Tesla Model 3' },
                            revenue: { type: 'number', example: 600.0 }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export const setupSwagger = (app: Application): void => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
