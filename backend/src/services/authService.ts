import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis de ambiente antes de qualquer coisa
// Garante que o .env seja carregado do diretório raiz do backend
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export class AuthService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private axiosInstance: AxiosInstance;
  private orchestratorUrl: string;
  private tenant: string;
  private clientId?: string;
  private clientSecret?: string;
  private personalAccessToken?: string;
  private authMethod: 'oauth2' | 'pat';

  constructor() {
    this.orchestratorUrl = process.env.ORCHESTRATOR_URL || 'https://cloud.uipath.com';
    this.tenant = process.env.ORCHESTRATOR_TENANT || '';
    this.clientId = process.env.ORCHESTRATOR_CLIENT_ID;
    this.clientSecret = process.env.ORCHESTRATOR_CLIENT_SECRET;
    this.personalAccessToken = process.env.ORCHESTRATOR_PAT;

    // Debug: verifica se as variáveis foram carregadas (sem expor valores sensíveis)
    if (!this.personalAccessToken && !this.clientId) {
      console.error('Variáveis de ambiente não encontradas. Verifique se o arquivo .env existe e está configurado corretamente.');
      console.error('ORCHESTRATOR_PAT:', this.personalAccessToken ? '***configurado***' : 'não encontrado');
      console.error('ORCHESTRATOR_CLIENT_ID:', this.clientId ? '***configurado***' : 'não encontrado');
    }

    // Determina o método de autenticação
    if (this.personalAccessToken) {
      this.authMethod = 'pat';
      this.accessToken = this.personalAccessToken;
      console.log('✅ Autenticação configurada: Personal Access Token');
    } else if (this.clientId && this.clientSecret) {
      this.authMethod = 'oauth2';
      console.log('✅ Autenticação configurada: OAuth2 Client Credentials');
    } else {
      throw new Error('Configure ORCHESTRATOR_PAT ou ORCHESTRATOR_CLIENT_ID e ORCHESTRATOR_CLIENT_SECRET no arquivo .env');
    }

    this.axiosInstance = axios.create({
      baseURL: this.orchestratorUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAccessToken(): Promise<string> {
    // Se usar PAT, retorna diretamente
    if (this.authMethod === 'pat') {
      return this.personalAccessToken!;
    }

    // Se usar OAuth2, verifica se o token ainda é válido (com margem de 60 segundos)
    if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }

    // Obtém novo token OAuth2
    await this.refreshToken();
    return this.accessToken!;
  }

  private async refreshToken(): Promise<void> {
    if (this.authMethod === 'pat') {
      return; // PAT não precisa refresh
    }

    try {
      const tokenUrl = `${this.orchestratorUrl}/identity_/connect/token`;
      
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', this.clientId!);
      params.append('client_secret', this.clientSecret!);
      params.append('scope', 'OR');

      const response = await axios.post<TokenResponse>(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    } catch (error) {
      console.error('Erro ao obter token de acesso:', error);
      throw new Error('Falha na autenticação com o Orchestrator');
    }
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  async getAuthenticatedHeaders(folderId?: number): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    if (folderId) {
      headers['X-UIPATH-OrganizationUnitId'] = folderId.toString();
    }

    return headers;
  }
}

export const authService = new AuthService();

