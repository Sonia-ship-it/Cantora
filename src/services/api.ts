const BASE_URL = process.env.BASE_URL;

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  voicePart: string;
  phone: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  role: string;
  voice_part: string;
  is_active: boolean;
  is_verified: boolean;
  avatar_url?: string;
  phone_number?: string;
  created_at: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request(endpoint: string, method: string = 'GET', body?: any, isMultipart: boolean = false) {
    const headers: Record<string, string> = {};

    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? (isMultipart ? body : JSON.stringify(body)) : undefined,
    });

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      const rawText = await response.text();
      console.log('API error response', response.status, rawText);
    }

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      if (data && data.detail) {
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail
            .map((err: any) => {
              const field = err.loc && err.loc.length > 1 ? err.loc[1] : '';
              return `${field ? field.toUpperCase() + ': ' : ''}${err.msg}`;
            })
            .join('\n');
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        }
      }
      throw new Error(errorMessage);
    }

    return data;
  }

  // ==========================================
  // 1. AUTHENTICATION & USERS
  // ==========================================
  async register(payload: RegisterPayload): Promise<UserResponse> {
    const body: any = {
      email: payload.email,
      password: payload.password,
      full_name: payload.fullName,
      voice_part: payload.voicePart.toLowerCase(),
    };
    if (payload.phone) {
      body.phone_number = payload.phone;
    }
    return this.request('/api/v1/auth/register', 'POST', body);
  }

  async login(identifier: string, password: string): Promise<LoginResponse> {
    const data = await this.request('/api/v1/auth/login', 'POST', {
      identifier,
      password,
    });
    if (data && data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async forgotPassword(email: string): Promise<string> {
    return this.request('/api/v1/auth/forgot-password', 'POST', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<string> {
    return this.request('/api/v1/auth/reset-password', 'POST', {
      token,
      new_password: newPassword,
    });
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const data = await this.request('/api/v1/auth/refresh', 'POST', {
      refresh_token: refreshToken,
    });
    if (data && data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/v1/auth/logout', 'POST');
    } finally {
      this.setToken(null);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<null> {
    return this.request('/api/v1/auth/change-password', 'POST', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  async getMe(): Promise<UserResponse> {
    return this.request('/api/v1/users/me', 'GET');
  }

  async updateMe(data: any): Promise<UserResponse> {
    return this.request('/api/v1/users/me', 'PATCH', data);
  }

  async getUser(userId: string): Promise<UserResponse> {
    return this.request(`/api/v1/users/${userId}`, 'GET');
  }

  async deactivateUser(userId: string): Promise<null> {
    return this.request(`/api/v1/users/${userId}/deactivate`, 'PATCH');
  }

  // ==========================================
  // 2. CHOIRS
  // ==========================================
  async listChoirs(): Promise<any> {
    return this.request('/api/v1/choirs/', 'GET');
  }

  async createChoir(name: string, description?: string): Promise<any> {
    return this.request('/api/v1/choirs/', 'POST', { name, description });
  }

  async getChoir(choirId: string): Promise<any> {
    return this.request(`/api/v1/choirs/${choirId}`, 'GET');
  }

  async joinChoir(inviteCode: string): Promise<any> {
    return this.request('/api/v1/choirs/join', 'POST', { invite_code: inviteCode });
  }

  async removeChoirMember(choirId: string, userId: string): Promise<any> {
    return this.request(`/api/v1/choirs/${choirId}/members/${userId}`, 'DELETE');
  }

  async regenerateChoirInvite(choirId: string): Promise<any> {
    return this.request(`/api/v1/choirs/${choirId}/regenerate-invite`, 'POST');
  }

  // ==========================================
  // 3. SHEET MUSIC
  // ==========================================
  async uploadSheetMusic(formData: FormData): Promise<any> {
    return this.request('/api/v1/sheets/upload', 'POST', formData, true);
  }

  async listSheets(): Promise<any> {
    return this.request('/api/v1/sheets/', 'GET');
  }

  async getSheet(sheetId: string): Promise<any> {
    return this.request(`/api/v1/sheets/${sheetId}`, 'GET');
  }

  async updateSheet(sheetId: string, data: any): Promise<any> {
    return this.request(`/api/v1/sheets/${sheetId}`, 'PATCH', data);
  }

  async deleteSheet(sheetId: string): Promise<any> {
    return this.request(`/api/v1/sheets/${sheetId}`, 'DELETE');
  }

  async getVoiceTracks(sheetId: string): Promise<any> {
    return this.request(`/api/v1/sheets/${sheetId}/voices`, 'GET');
  }

  async downloadVoiceTrack(sheetId: string, voicePart: string): Promise<any> {
    return this.request(`/api/v1/sheets/${sheetId}/voices/${voicePart.toLowerCase()}/download`, 'GET');
  }

  async getInstrumentTracks(sheetId: string): Promise<any> {
    return this.request(`/api/v1/sheets/${sheetId}/instruments`, 'GET');
  }

  async updateInstrumentTrack(sheetId: string, instrument: string, data: any): Promise<any> {
    return this.request(`/api/v1/sheets/${sheetId}/instruments/${instrument}`, 'PATCH', data);
  }

  // ==========================================
  // 4. REHEARSALS
  // ==========================================
  async createRehearsal(choirId: string, data: any): Promise<any> {
    return this.request(`/api/v1/rehearsals/${choirId}`, 'POST', data);
  }

  async startRehearsal(sessionId: string): Promise<any> {
    return this.request(`/api/v1/rehearsals/${sessionId}/start`, 'POST');
  }

  async endRehearsal(sessionId: string): Promise<any> {
    return this.request(`/api/v1/rehearsals/${sessionId}/end`, 'POST');
  }

  async getRehearsal(sessionId: string): Promise<any> {
    return this.request(`/api/v1/rehearsals/${sessionId}`, 'GET');
  }

  // ==========================================
  // 5. PRACTICE
  // ==========================================
  async listPracticeSessions(): Promise<any> {
    return this.request('/api/v1/practice/', 'GET');
  }

  async startPractice(data: any): Promise<any> {
    return this.request('/api/v1/practice/', 'POST', data);
  }

  async getAiPracticePlan(sessionId: string): Promise<any> {
    return this.request(`/api/v1/practice/${sessionId}/ai-plan`, 'GET');
  }

  async completePractice(sessionId: string, data: any): Promise<any> {
    return this.request(`/api/v1/practice/${sessionId}/complete`, 'PATCH', data);
  }

  // ==========================================
  // 6. EMOTION DETECTION
  // ==========================================
  async detectEmotion(audioData: any): Promise<any> {
    return this.request('/api/v1/emotion/detect', 'POST', audioData);
  }

  async getEmotionHistory(): Promise<any> {
    return this.request('/api/v1/emotion/history', 'GET');
  }

  // ==========================================
  // 7. BEAT PATTERNS
  // ==========================================
  async createBeatPattern(data: any): Promise<any> {
    return this.request('/api/v1/beats/', 'POST', data);
  }

  async listBeatPatterns(): Promise<any> {
    return this.request('/api/v1/beats/', 'GET');
  }

  async getBeatPattern(patternId: string): Promise<any> {
    return this.request(`/api/v1/beats/${patternId}`, 'GET');
  }

  async deleteBeatPattern(patternId: string): Promise<any> {
    return this.request(`/api/v1/beats/${patternId}`, 'DELETE');
  }

  async applyBeatPattern(patternId: string, sheetId: string): Promise<any> {
    return this.request(`/api/v1/beats/${patternId}/apply/${sheetId}`, 'POST');
  }

  // ==========================================
  // 8. ADMIN OPERATIONS
  // ==========================================
  async listAdminPlans(): Promise<any> {
    return this.request('/api/v1/admin/plans', 'GET');
  }

  async createAdminPlan(data: any): Promise<any> {
    return this.request('/api/v1/admin/plans', 'POST', data);
  }

  async updateAdminPlan(planId: string, data: any): Promise<any> {
    return this.request(`/api/v1/admin/plans/${planId}`, 'PATCH', data);
  }

  async deleteAdminPlan(planId: string): Promise<any> {
    return this.request(`/api/v1/admin/plans/${planId}`, 'DELETE');
  }

  async listAdminFeatures(): Promise<any> {
    return this.request('/api/v1/admin/features', 'GET');
  }

  async createAdminFeature(data: any): Promise<any> {
    return this.request('/api/v1/admin/features', 'POST', data);
  }

  async updateAdminFeature(featureId: string, data: any): Promise<any> {
    return this.request(`/api/v1/admin/features/${featureId}`, 'PATCH', data);
  }

  async grantUserFeature(userId: string, data: any): Promise<any> {
    return this.request(`/api/v1/admin/users/${userId}/features`, 'POST', data);
  }

  async listUserFeatures(userId: string): Promise<any> {
    return this.request(`/api/v1/admin/users/${userId}/features`, 'GET');
  }

  async revokeUserFeature(userId: string, featureKey: string): Promise<any> {
    return this.request(`/api/v1/admin/users/${userId}/features/${featureKey}`, 'DELETE');
  }

  async grantChoirFeature(data: any): Promise<any> {
    return this.request('/api/v1/admin/choirs/features', 'POST', data);
  }

  // ==========================================
  // 9. PAYMENTS & SUBSCRIPTIONS
  // ==========================================
  async listPublicPlans(): Promise<any> {
    return this.request('/api/v1/payments/plans', 'GET');
  }

  async initiatePayment(data: any): Promise<any> {
    return this.request('/api/v1/payments/initiate', 'POST', data);
  }

  async verifyPayment(data: any): Promise<any> {
    return this.request('/api/v1/payments/verify', 'POST', data);
  }

  async getMySubscription(): Promise<any> {
    return this.request('/api/v1/payments/my-subscription', 'GET');
  }

  async startTrial(): Promise<any> {
    return this.request('/api/v1/payments/start-trial', 'POST');
  }

  async getMyPayments(): Promise<any> {
    return this.request('/api/v1/payments/my-payments', 'GET');
  }
}

export const api = new ApiService();
