/**
 * Type-safe API client for Python FastAPI backend.
 * Provides interfaces matching the Python Pydantic models.
 */

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Common types
export type SafetyLevel = 'off' | 'low' | 'medium' | 'high';
export type ImageModel = 'gemini-2.5-flash-image-preview' | 'imagen-4.0-fast-generate-001';
export type VideoModel = 'veo-3.0-generate-001' | 'veo-3.0-fast-generate-001' | 'veo-2.0-generate-001';
export type VideoStatus = 'pending' | 'running' | 'completed' | 'failed';

// Content Generation Types
export interface ContentGenerationRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
  safetyLevel?: SafetyLevel;
}

export interface UsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

export interface ContentGenerationResponse {
  response: string;
  model: string;
  usage?: UsageMetadata;
}

// Media Types
export interface ImageData {
  imageBytes: string;
  mimeType: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  model?: ImageModel;
  aspectRatio?: string;
}

export interface ImageGenerationResponse {
  image: ImageData;
}

export interface ImageEditRequest {
  prompt: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface ImageEditResponse {
  image: ImageData;
}

export interface ImageComposeRequest {
  prompt: string;
  images: ImageData[];
}

export interface ImageComposeResponse {
  image: ImageData;
}

// Video Types
export interface VideoGenerationRequest {
  prompt: string;
  model?: VideoModel;
  aspectRatio?: string;
  negativePrompt?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface VideoGenerationResponse {
  operationId: string;
  statusUrl: string;
}

export interface VideoStatusResponse {
  operationId: string;
  status: VideoStatus;
  progress?: number;
  videoUrl?: string;
  errorMessage?: string;
}

// API Response Types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: string;
  solutions?: string[];
}

export interface QuotaExceededResponse extends ErrorResponse {
  error: 'QuotaExceeded';
  retryAfter?: number;
}

// API Client Class
class APIClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new APIError(
          data.message || 'Request failed',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        'Network error',
        0,
        { message: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  // Content Generation API
  async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const response = await this.request<ContentGenerationResponse>(
      '/api/v1/content/generate',
      {
        method: 'POST',
        body: JSON.stringify({
          prompt: request.prompt,
          model: request.model || 'gemini-2.0-flash',
          temperature: request.temperature || 1.0,
          top_p: request.topP || 0.95,
          max_output_tokens: request.maxOutputTokens || 4096,
          safety_level: request.safetyLevel || 'off',
        }),
      }
    );

    if (!response.success || !response.data) {
      throw new APIError('Content generation failed', 500, response);
    }

    return response.data;
  }

  // Media API
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const response = await this.request<ImageGenerationResponse>(
      '/api/v1/media/generate',
      {
        method: 'POST',
        body: JSON.stringify({
          prompt: request.prompt,
          model: request.model || 'gemini-2.5-flash-image-preview',
          aspect_ratio: request.aspectRatio || '16:9',
        }),
      }
    );

    if (!response.success || !response.data) {
      throw new APIError('Image generation failed', 500, response);
    }

    return response.data;
  }

  async editImage(request: ImageEditRequest): Promise<ImageEditResponse> {
    const formData = new FormData();
    formData.append('prompt', request.prompt);
    
    if (request.imageBase64) {
      formData.append('image_base64', request.imageBase64);
      formData.append('image_mime_type', request.imageMimeType || 'image/png');
    }

    const response = await this.request<ImageEditResponse>(
      '/api/v1/media/edit',
      {
        method: 'POST',
        headers: {
          // Remove Content-Type to let browser set it with boundary
        },
        body: formData,
      }
    );

    if (!response.success || !response.data) {
      throw new APIError('Image editing failed', 500, response);
    }

    return response.data;
  }

  async composeImages(request: ImageComposeRequest): Promise<ImageComposeResponse> {
    const formData = new FormData();
    formData.append('prompt', request.prompt);
    
    // Convert ImageData to files for FormData
    request.images.forEach((image, index) => {
      const blob = new Blob([Uint8Array.from(atob(image.imageBytes), c => c.charCodeAt(0))], {
        type: image.mimeType,
      });
      formData.append('image_files', blob, `image_${index}.${image.mimeType.split('/')[1]}`);
    });

    const response = await this.request<ImageComposeResponse>(
      '/api/v1/media/compose',
      {
        method: 'POST',
        headers: {
          // Remove Content-Type to let browser set it with boundary
        },
        body: formData,
      }
    );

    if (!response.success || !response.data) {
      throw new APIError('Image composition failed', 500, response);
    }

    return response.data;
  }

  // Video API
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const formData = new FormData();
    formData.append('prompt', request.prompt);
    formData.append('model', request.model || 'veo-3.0-generate-001');
    
    if (request.aspectRatio) {
      formData.append('aspect_ratio', request.aspectRatio);
    }
    
    if (request.negativePrompt) {
      formData.append('negative_prompt', request.negativePrompt);
    }
    
    if (request.imageBase64) {
      formData.append('image_base64', request.imageBase64);
      formData.append('image_mime_type', request.imageMimeType || 'image/png');
    }

    const response = await this.request<VideoGenerationResponse>(
      '/api/v1/video/generate',
      {
        method: 'POST',
        headers: {
          // Remove Content-Type to let browser set it with boundary
        },
        body: formData,
      }
    );

    if (!response.success || !response.data) {
      throw new APIError('Video generation failed', 500, response);
    }

    return response.data;
  }

  async getVideoStatus(operationId: string): Promise<VideoStatusResponse> {
    const response = await this.request<VideoStatusResponse>(
      `/api/v1/video/status/${operationId}`,
      {
        method: 'GET',
      }
    );

    if (!response.success || !response.data) {
      throw new APIError('Video status check failed', 500, response);
    }

    return response.data;
  }

  async downloadVideo(operationId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/v1/video/download/${operationId}`, {
      headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
    });

    if (!response.ok) {
      throw new APIError('Video download failed', response.status);
    }

    return response.blob();
  }
}

// Error class
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export types for use in components
export type {
};

// Re-export interfaces since they're already exported as interfaces
export type { ContentGenerationRequest, ContentGenerationResponse, ImageGenerationRequest, ImageGenerationResponse, ImageEditRequest, ImageEditResponse, ImageComposeRequest, ImageComposeResponse, VideoGenerationRequest, VideoGenerationResponse, VideoStatusResponse, APIResponse, ErrorResponse, QuotaExceededResponse };
