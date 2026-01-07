import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { Readable } from 'stream';

/**
 * File Proxy Service
 * Forwards file upload requests to backend-shms
 */
class FileProxyService {
  private shmsClient: AxiosInstance;
  private shmsUrl: string;

  constructor() {
    this.shmsUrl = process.env.BACKEND_SHMS_URL || 'http://backend-shms:4003';
    this.shmsClient = axios.create({
      baseURL: this.shmsUrl,
      timeout: 300000, // 5 minutes timeout for large file uploads
    });
  }

  /**
   * Proxy file upload to backend-shms
   * @param file Multer file object
   * @param body Request body with metadata
   * @param userId Optional user ID from authentication
   */
  async proxyUpload(file: Express.Multer.File, body: any, userId?: number): Promise<any> {
    try {
      // Create FormData to forward the file
      const formData = new FormData();
      
      // Add the file - use file path if available, otherwise use buffer
      if (file.path && fs.existsSync(file.path)) {
        // Use file stream for better memory efficiency
        formData.append('file', fs.createReadStream(file.path), {
          filename: body.filename || file.originalname,
          contentType: file.mimetype,
        });
      } else if (file.buffer) {
        // Use buffer if path is not available
        const fileStream = Readable.from(file.buffer);
        formData.append('file', fileStream, {
          filename: body.filename || file.originalname,
          contentType: file.mimetype,
        });
      } else {
        throw new Error('File data not available');
      }

      // Forward all body parameters
      if (body.filename) formData.append('filename', body.filename);
      if (body.category) formData.append('category', body.category);
      if (body.entityType) formData.append('entityType', body.entityType);
      if (body.entityId) formData.append('entityId', body.entityId);
      if (body.referenceId) formData.append('entityId', body.referenceId); // Map referenceId to entityId
      if (body.referenceType) {
        // Map referenceType to entityType if entityType not provided
        if (!body.entityType) {
          const entityTypeMap: Record<string, string> = {
            'TICKET_ATTACHMENT': 'ticket',
            'COMPANY': 'company',
            'CONTRACT': 'contract',
            'USER': 'user',
          };
          const mappedEntityType = entityTypeMap[body.referenceType] || 'ticket';
          formData.append('entityType', mappedEntityType);
        }
      }
      if (body.chunkIndex !== undefined) formData.append('chunkIndex', body.chunkIndex);
      if (body.totalChunks !== undefined) formData.append('totalChunks', body.totalChunks);

      // Make request to backend-shms
      const response = await this.shmsClient.post('/api/v1/files/upload', formData, {
        headers: {
          ...formData.getHeaders(),
          // Forward authorization if available
          ...(userId && { 'X-User-Id': userId.toString() }),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      return response.data;
    } catch (error: any) {
      console.error('[FileProxy] Error proxying upload to backend-shms:', error.message);
      if (error.response) {
        // Forward the error response from backend-shms
        throw {
          status: error.response.status,
          message: error.response.data?.message || error.message,
          data: error.response.data,
        };
      }
      throw {
        status: 500,
        message: error.message || 'Failed to proxy file upload to backend-shms',
      };
    }
  }

  /**
   * Get file from backend-shms
   * @param filePath File path to retrieve
   */
  async getFile(filePath: string): Promise<Buffer> {
    try {
      const response = await this.shmsClient.get(filePath, {
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data);
    } catch (error: any) {
      console.error('[FileProxy] Error getting file from backend-shms:', error.message);
      throw {
        status: error.response?.status || 500,
        message: error.message || 'Failed to get file from backend-shms',
      };
    }
  }

  /**
   * Update file record in backend-shms to link it to an entity
   * @param filePath File path to update
   * @param entityType Entity type (contract, ticket, user, company)
   * @param entityId Entity ID
   * @param userId Optional user ID
   */
  async updateFileEntity(filePath: string, entityType: string, entityId: number, userId?: number): Promise<any> {
    try {
      const response = await this.shmsClient.patch('/api/v1/files/update-entity', {
        filePath,
        entityType,
        entityId,
        userId,
      });
      return response.data;
    } catch (error: any) {
      console.error('[FileProxy] Error updating file entity in backend-shms:', error.message);
      if (error.response) {
        throw {
          status: error.response.status,
          message: error.response.data?.message || error.message,
          data: error.response.data,
        };
      }
      throw {
        status: 500,
        message: error.message || 'Failed to update file entity in backend-shms',
      };
    }
  }

  /**
   * Update multiple file records in backend-shms to link them to an entity
   * @param filePaths Array of file paths to update
   * @param entityType Entity type (contract, ticket, user, company)
   * @param entityId Entity ID
   * @param userId Optional user ID
   */
  async updateFilesEntity(filePaths: string[], entityType: string, entityId: number, userId?: number): Promise<any> {
    try {
      const response = await this.shmsClient.patch('/api/v1/files/update-entities', {
        filePaths,
        entityType,
        entityId,
        userId,
      });
      return response.data;
    } catch (error: any) {
      console.error('[FileProxy] Error updating files entity in backend-shms:', error.message);
      if (error.response) {
        throw {
          status: error.response.status,
          message: error.response.data?.message || error.message,
          data: error.response.data,
        };
      }
      throw {
        status: 500,
        message: error.message || 'Failed to update files entity in backend-shms',
      };
    }
  }

  /**
   * Update file records in backend-shms by file IDs
   * @param fileIds Array of file IDs to update
   * @param entityType Entity type (contract, ticket, user, company)
   * @param entityId Entity ID
   * @param userId Optional user ID
   */
  async updateFilesByIds(fileIds: number[], entityType: string, entityId: number, userId?: number): Promise<any> {
    try {
      const response = await this.shmsClient.patch('/api/v1/files/update-by-ids', {
        fileIds,
        entityType,
        entityId,
        userId,
      });
      return response.data;
    } catch (error: any) {
      console.error('[FileProxy] Error updating files by IDs in backend-shms:', error.message);
      if (error.response) {
        throw {
          status: error.response.status,
          message: error.response.data?.message || error.message,
          data: error.response.data,
        };
      }
      throw {
        status: 500,
        message: error.message || 'Failed to update files by IDs in backend-shms',
      };
    }
  }
}

const fileProxyService = new FileProxyService();
export default fileProxyService;

