import { useState } from 'react';

// Talking Avatar Integration using D-ID API
export interface TalkingAvatarConfig {
  apiKey: string;
  sourceUrl: string; // URL to the avatar image
  voiceId?: string;
  language?: string;
}

export interface AvatarVideoResponse {
  id: string;
  status: 'created' | 'started' | 'done' | 'error';
  result_url?: string;
  error?: string;
}

export class TalkingAvatarService {
  private config: TalkingAvatarConfig;
  private baseUrl = 'https://api.d-id.com';

  constructor(config: TalkingAvatarConfig) {
    this.config = config;
  }

  async createTalkingVideo(text: string): Promise<AvatarVideoResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/talks`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_url: this.config.sourceUrl,
          script: {
            type: 'text',
            input: text,
            provider: {
              type: 'microsoft',
              voice_id: this.config.voiceId || 'en-US-AriaNeural'
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`D-ID API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating talking video:', error);
      throw error;
    }
  }

  async getVideoStatus(videoId: string): Promise<AvatarVideoResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/talks/${videoId}`, {
        headers: {
          'Authorization': `Basic ${this.config.apiKey}`,
        }
      });

      if (!response.ok) {
        throw new Error(`D-ID API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting video status:', error);
      throw error;
    }
  }

  async pollVideoCompletion(videoId: string, maxAttempts: number = 30): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getVideoStatus(videoId);
      
      if (status.status === 'done' && status.result_url) {
        return status.result_url;
      }
      
      if (status.status === 'error') {
        throw new Error(`Video generation failed: ${status.error}`);
      }
      
      // Wait 2 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Video generation timeout');
  }
}

// Alternative: Simple animated avatar using CSS animations
export const createAnimatedAvatar = (text: string, onComplete?: () => void) => {
  // This is a fallback implementation using CSS animations
  // In a real implementation, you would integrate with D-ID, HeyGen, or Synthesia
  
  const avatarElement = document.getElementById('ai-avatar');
  if (!avatarElement) return;

  // Add speaking animation
  avatarElement.classList.add('animate-pulse', 'scale-105');
  
  // Simulate speaking duration based on text length
  const speakingDuration = Math.max(2000, text.length * 50);
  
  setTimeout(() => {
    avatarElement.classList.remove('animate-pulse', 'scale-105');
    onComplete?.();
  }, speakingDuration);
};

// Hook for using talking avatar in React components
export const useTalkingAvatar = (config?: TalkingAvatarConfig) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const speakText = async (text: string) => {
    if (!config) {
      // Fallback to CSS animation
      createAnimatedAvatar(text);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const avatarService = new TalkingAvatarService(config);
      const videoResponse = await avatarService.createTalkingVideo(text);
      
      if (videoResponse.status === 'created') {
        const resultUrl = await avatarService.pollVideoCompletion(videoResponse.id);
        setVideoUrl(resultUrl);
      } else {
        throw new Error('Failed to create video');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fallback to CSS animation
      createAnimatedAvatar(text);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    speakText,
    isGenerating,
    videoUrl,
    error
  };
};
