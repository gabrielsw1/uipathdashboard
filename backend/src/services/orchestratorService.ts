import axios from 'axios';
import { authService } from './authService';
import { cacheService } from './cacheService';
import {
  JobDto,
  ProcessDto,
  ReleaseDto,
  RobotDto,
  SessionDto,
  FolderDto,
  MachineDto,
  CountStats,
  LicenseStatsModel,
  ConsumptionLicenseStatsModel,
  ODataResponse,
  ODataQueryParams,
  JobFilters,
  ProcessFilters,
  RobotFilters,
  SessionFilters,
  QueueDefinitionDto,
  QueueItemDto,
} from '../types/orchestrator';
import { buildJobFilter, buildProcessFilter, buildRobotFilter, buildSessionFilter } from '../utils/odataBuilder';

export class OrchestratorService {
  private baseUrl: string;
  private tenant: string;
  private organization: string;

  constructor() {
    this.baseUrl = process.env.ORCHESTRATOR_URL || 'https://cloud.uipath.com';
    this.tenant = process.env.ORCHESTRATOR_TENANT || '';
    // Organization geralmente é igual ao tenant, mas pode ser diferente
    this.organization = process.env.ORCHESTRATOR_ORGANIZATION || this.tenant;
  }

  private getBasePath(): string {
    // Formato: https://cloud.uipath.com/{tenant}/{organization}/orchestrator_
    // No swagger exemplo: /startaideia/StartaIdeia/orchestrator_/
    // Removemos a barra final para evitar dupla barra quando o endpoint começa com /
    return `${this.baseUrl}/${this.tenant}/${this.organization}/orchestrator_`;
  }

  /**
   * Serializa parâmetros OData corretamente, mantendo o $ nos nomes dos parâmetros
   * e codificando apenas os valores
   */
  private serializeODataParams(params: Record<string, any>): string {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/bc983107-79cf-4e86-8696-7c4fa6a36d78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'orchestratorService.ts:47',message:'serializeODataParams entry',data:{params:JSON.stringify(params)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
    // #endregion
    const parts: string[] = [];
    
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      
      // Para boolean, usar true/false (não "true"/"false")
      if (typeof value === 'boolean') {
        parts.push(`${key}=${value}`);
      } else if (typeof value === 'number') {
        parts.push(`${key}=${value}`);
      } else {
        // Para strings, codificar apenas o valor
        parts.push(`${key}=${encodeURIComponent(value)}`);
      }
    }
    
    const result = parts.join('&');
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/bc983107-79cf-4e86-8696-7c4fa6a36d78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'orchestratorService.ts:65',message:'serializeODataParams exit',data:{result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
    // #endregion
    return result;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' | 'PATCH' = 'GET',
    data?: any,
    folderId?: number,
    queryParams?: ODataQueryParams
  ): Promise<T> {
    const headers = await authService.getAuthenticatedHeaders(folderId);
    // Criar uma cópia do objeto headers para evitar mutação
    const requestHeaders = { ...headers };
    const url = `${this.getBasePath()}${endpoint}`;
    
    // Log para debug: verificar se o header está sendo enviado
    if (endpoint.includes('/odata/Processes')) {
      console.log(`[makeRequest] Endpoint: ${endpoint}, folderId recebido: ${folderId}, header no objeto: ${requestHeaders['X-UIPATH-OrganizationUnitId'] || 'NÃO ENVIADO'}`);
    }

    // Converter queryParams para o formato que o axios espera
    const params: Record<string, any> = {};
    if (queryParams) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/bc983107-79cf-4e86-8696-7c4fa6a36d78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'orchestratorService.ts:77',message:'queryParams received',data:{queryParams:JSON.stringify(queryParams)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C'})}).catch(()=>{});
      // #endregion
      // Adicionar parâmetros OData
      if (queryParams.$filter) params.$filter = queryParams.$filter;
      if (queryParams.$orderby) params.$orderby = queryParams.$orderby;
      if (queryParams.$top !== undefined) params.$top = queryParams.$top;
      if (queryParams.$skip !== undefined) params.$skip = queryParams.$skip;
      if (queryParams.$select) params.$select = queryParams.$select;
      if (queryParams.$expand) params.$expand = queryParams.$expand;
      // Só incluir $count se for true - a API não aceita $count=false
      if (queryParams.$count === true) params.$count = true;
      
      // Adicionar quaisquer parâmetros adicionais (não-OData) que possam ter sido passados
      Object.keys(queryParams).forEach(key => {
        if (!key.startsWith('$') && !params.hasOwnProperty(key)) {
          params[key] = (queryParams as any)[key];
        }
      });
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/bc983107-79cf-4e86-8696-7c4fa6a36d78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'orchestratorService.ts:96',message:'params built',data:{params:JSON.stringify(params),countValue:params.$count,countType:typeof params.$count},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C'})}).catch(()=>{});
      // #endregion
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/bc983107-79cf-4e86-8696-7c4fa6a36d78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'orchestratorService.ts:98',message:'makeRequest before axios',data:{url,params:JSON.stringify(params),hasParamsSerializer:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const config = {
      method,
      url,
      headers: requestHeaders,
      params,
      // Usar serialização customizada para garantir que parâmetros com $ sejam tratados corretamente
      paramsSerializer: (p: Record<string, any>) => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/bc983107-79cf-4e86-8696-7c4fa6a36d78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'orchestratorService.ts:104',message:'paramsSerializer called',data:{params:JSON.stringify(p)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const serialized = this.serializeODataParams(p);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/bc983107-79cf-4e86-8696-7c4fa6a36d78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'orchestratorService.ts:107',message:'paramsSerializer result',data:{serialized},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return serialized;
      },
      ...(data && { data }),
      validateStatus: () => true, // Não lançar erro automaticamente
    };

    try {
      const response = await axios.request<T>(config);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/bc983107-79cf-4e86-8696-7c4fa6a36d78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'orchestratorService.ts:115',message:'axios response received',data:{status:response.status,url:response.config.url,requestUrl:response.request?.res?.responseUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,D'})}).catch(()=>{});
      // #endregion
      
      // Log detalhado para processos
      if (endpoint.includes('/odata/Processes')) {
        const responseData = response.data as any;
        const processCount = responseData?.value?.length || 0;
        const processKeys = responseData?.value?.slice(0, 3).map((p: any) => p.Key).join(', ') || 'nenhum';
        // Usar response.config.headers para ver os headers realmente enviados
        const sentHeaders = response.config.headers || {};
        console.log(`[makeRequest] Resposta da API - Status: ${response.status}, Processos: ${processCount}, Primeiros Keys: ${processKeys}`);
        console.log(`[makeRequest] Headers ENVIADOS na requisição:`, JSON.stringify({
          'X-UIPATH-OrganizationUnitId': sentHeaders['X-UIPATH-OrganizationUnitId'] || sentHeaders['x-uipath-organizationunitid'] || 'NÃO ENVIADO',
          'Authorization': sentHeaders['Authorization'] ? 'Bearer ***' : 'NÃO ENVIADO'
        }, null, 2));
        console.log(`[makeRequest] folderId recebido: ${folderId}, URL final: ${response.config.url}`);
      }
      
      // Verificar se houve erro HTTP
      if (response.status >= 400) {
        const errorData = (response as any).data || {};
        const errorMessage = errorData.message || `HTTP ${response.status}`;
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/bc983107-79cf-4e86-8696-7c4fa6a36d78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'orchestratorService.ts:120',message:'HTTP error response',data:{status:response.status,errorMessage,errorData:JSON.stringify(errorData),finalUrl:response.config.url,requestUrl:response.request?.res?.responseUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C,D,E'})}).catch(()=>{});
        // #endregion
        console.error(`Erro na requisição ${method} ${endpoint}:`, errorMessage);
        console.error('URL completa:', response.config.url);
        console.error('Parâmetros:', params);
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/bc983107-79cf-4e86-8696-7c4fa6a36d78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'orchestratorService.ts:132',message:'axios error catch',data:{status:error.response?.status,errorData:JSON.stringify(error.response?.data),errorMessage:error.message,configUrl:error.config?.url,requestUrl:error.request?.res?.responseUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C,D,E'})}).catch(()=>{});
        // #endregion
        console.error(`Erro na requisição ${method} ${endpoint}:`, error.response.data || error.message);
        console.error('URL completa:', error.config?.url);
        console.error('Parâmetros:', params);
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/bc983107-79cf-4e86-8696-7c4fa6a36d78',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'orchestratorService.ts:137',message:'axios non-response error',data:{errorMessage:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.error(`Erro na requisição ${method} ${endpoint}:`, error.message);
      }
      throw error;
    }
  }

  // Stats Endpoints
  async getCountStats(filters?: JobFilters, folderId?: number): Promise<CountStats[]> {
    // Sempre calcular a partir dos dados reais (processos e pastas)
    // Isso garante que funciona mesmo sem filtros
    const finalFolderId = folderId ?? filters?.folderId;
    
    const [processes, folders] = await Promise.all([
      this.getProcesses({ folderId: finalFolderId }, undefined, finalFolderId),
      this.getFolders(),
    ]);

    // Filtrar processos se processKey estiver definido
    let filteredProcesses = processes.value || [];
    if (filters?.processKey) {
      const processKey = filters.processKey;
      // O Process.Key pode incluir versão (ex: "ProcessName:1.0.0")
      // Precisamos verificar se o Process.Key corresponde ao processKey (exato ou começa com)
      filteredProcesses = filteredProcesses.filter(p => {
        // Match exato
        if (p.Key === processKey) return true;
        // Match parcial (se processKey é "ProcessName" e Process.Key é "ProcessName:1.0.0")
        if (p.Key.startsWith(processKey + ':')) return true;
        // Match reverso (se processKey é "ProcessName:1.0.0" e Process.Key é "ProcessName")
        if (processKey.startsWith(p.Key + ':')) return true;
        return false;
      });
    }

    // Filtrar pastas se necessário
    let filteredFolders = folders;
    if (finalFolderId) {
      // Contar apenas a pasta selecionada e suas subpastas
      const subfolderIds = await this.getSubfolderIds(finalFolderId);
      filteredFolders = folders.filter(f => subfolderIds.includes(f.Id));
    }

    return [
      { title: 'Processes', count: filteredProcesses.length || 0 },
      { title: 'Folders', count: filteredFolders.length || 0 },
    ];
  }

  async getJobsStats(filters?: JobFilters, folderId?: number): Promise<CountStats[]> {
    // Se há filtros, calcular a partir dos jobs filtrados (sem cache para garantir dados atualizados)
    if (filters && (filters.folderId || filters.processKey || filters.releaseKey || filters.robotId || filters.state || filters.startDate || filters.endDate)) {
      // Buscar jobs com paginação (máximo 1000 por requisição)
      const allJobs: JobDto[] = [];
      let skip = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const jobs = await this.getJobs(filters, { $top: pageSize, $skip: skip }, folderId || filters.folderId);
        
        if (jobs.value && jobs.value.length > 0) {
          allJobs.push(...jobs.value);
          skip += pageSize;
          // Se retornou menos que pageSize, não há mais dados
          hasMore = jobs.value.length === pageSize;
        } else {
          hasMore = false;
        }
      }
      
      const stats: Record<string, number> = {};
      allJobs.forEach(job => {
        const state = job.State || 'Unknown';
        stats[state] = (stats[state] || 0) + 1;
      });

      return Object.entries(stats).map(([title, count]) => ({ title, count }));
    }

    // Sem filtros, usar API original (com cache)
    const cacheKey = 'jobsStats';
    const cached = cacheService.getStats<CountStats[]>(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest<CountStats[]>('/api/Stats/GetJobsStats');
    cacheService.setStats(cacheKey, data);
    return data;
  }

  async getSessionsStats(filters?: JobFilters, folderId?: number): Promise<CountStats[]> {
    // Se há filtros, calcular a partir das sessões filtradas (sem cache para garantir dados atualizados)
    if (filters && (filters.folderId || filters.robotId || filters.machineId || filters.processKey || filters.releaseKey || filters.state || filters.startDate || filters.endDate)) {
      // Se há filtros de jobs (processKey, releaseKey, state, dates), primeiro buscar os robots únicos desses jobs
      let robotIds: number[] | undefined = undefined;
      if (filters.processKey || filters.releaseKey || filters.state || filters.startDate || filters.endDate) {
        const jobs = await this.getJobs(filters, { $expand: 'Robot' }, folderId || filters.folderId);
        const uniqueRobotIds = new Set<number>();
        jobs.value?.forEach(job => {
          if (job.Robot?.Id) uniqueRobotIds.add(job.Robot.Id);
        });
        robotIds = Array.from(uniqueRobotIds);
        
        // Se não há robots, retornar array vazio
        if (robotIds.length === 0) {
          return [];
        }
      }
      
      const sessionFilters: SessionFilters = {
        folderId: filters.folderId,
        robotId: filters.robotId || (robotIds && robotIds.length === 1 ? robotIds[0] : undefined),
        machineId: filters.machineId,
      };
      
      // Se temos múltiplos robotIds dos jobs filtrados, buscar todas as sessions e filtrar
      let sessions = await this.getSessions(sessionFilters, undefined, folderId || filters.folderId);
      
      // Se temos robotIds dos jobs filtrados, filtrar sessions para incluir apenas esses robots
      if (robotIds && robotIds.length > 1) {
        sessions = {
          ...sessions,
          value: sessions.value?.filter(s => s.Robot?.Id && robotIds!.includes(s.Robot.Id)) || [],
        };
      }
      
      const stats: Record<string, number> = {};
      sessions.value?.forEach(session => {
        const state = session.State || 'Unknown';
        stats[state] = (stats[state] || 0) + 1;
      });

      return Object.entries(stats).map(([title, count]) => ({ title, count }));
    }

    // Sem filtros, usar API original (com cache)
    const cacheKey = 'sessionsStats';
    const cached = cacheService.getStats<CountStats[]>(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest<CountStats[]>('/api/Stats/GetSessionsStats');
    cacheService.setStats(cacheKey, data);
    return data;
  }

  async getLicenseStats(days?: number, tenantId?: number): Promise<LicenseStatsModel[]> {
    const cacheKey = `licenseStats_${days || 30}_${tenantId || 'default'}`;
    const cached = cacheService.getStats<LicenseStatsModel[]>(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams();
    if (days) params.append('days', days.toString());
    if (tenantId) params.append('tenantId', tenantId.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await this.makeRequest<LicenseStatsModel[]>(`/api/Stats/GetLicenseStats${query}`);
    cacheService.setStats(cacheKey, data);
    return data;
  }

  async getConsumptionLicenseStats(days?: number, tenantId?: number): Promise<ConsumptionLicenseStatsModel[]> {
    const cacheKey = `consumptionLicenseStats_${days || 30}_${tenantId || 'default'}`;
    const cached = cacheService.getStats<ConsumptionLicenseStatsModel[]>(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams();
    if (days) params.append('days', days.toString());
    if (tenantId) params.append('tenantId', tenantId.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await this.makeRequest<ConsumptionLicenseStatsModel[]>(`/api/Stats/GetConsumptionLicenseStats${query}`);
    cacheService.setStats(cacheKey, data);
    return data;
  }

  // Folders
  async getFolders(): Promise<FolderDto[]> {
    const cached = cacheService.getFolders<FolderDto[]>();
    if (cached) return cached;

    // Buscar todos os campos (sem $select) para garantir que FolderType, FeedType e IsPersonal sejam retornados
    const data = await this.makeRequest<{ value: FolderDto[] }>('/odata/Folders');
    const folders = data.value || [];
    cacheService.setFolders(folders);
    return folders;
  }

  async getAllFoldersForCurrentUser(): Promise<{ value: FolderDto[] }> {
    const data = await this.makeRequest<{ value: FolderDto[] }>('/api/Folders/GetAllForCurrentUser');
    return data;
  }

  /**
   * Retorna todos os IDs de subpastas (incluindo a pasta pai) recursivamente
   */
  async getSubfolderIds(parentFolderId: number): Promise<number[]> {
    const folders = await this.getFolders();
    const result: number[] = [parentFolderId];
    
    const findChildren = (parentId: number) => {
      folders.forEach(folder => {
        if (folder.ParentId === parentId) {
          result.push(folder.Id);
          findChildren(folder.Id); // Recursivo para subpastas
        }
      });
    };

    findChildren(parentFolderId);
    return result;
  }

  // Jobs
  async getJobs(filters?: JobFilters, queryParams?: ODataQueryParams, folderId?: number): Promise<ODataResponse<JobDto>> {
    // Construir o filtro combinado
    const customFilter = filters ? buildJobFilter(filters) : undefined;
    const combinedFilter = customFilter && queryParams?.$filter 
      ? `${customFilter} and ${queryParams.$filter}`
      : customFilter || queryParams?.$filter;

    const finalQueryParams: ODataQueryParams = {
      ...queryParams,
      $filter: combinedFilter,
    };

    return this.makeRequest<ODataResponse<JobDto>>('/odata/Jobs', 'GET', undefined, folderId, finalQueryParams);
  }

  async getJobById(key: number, folderId?: number): Promise<JobDto> {
    return this.makeRequest<JobDto>(`/odata/Jobs(${key})`, 'GET', undefined, folderId);
  }

  async stopJob(key: number, strategy: 'SoftStop' | 'Kill', folderId?: number): Promise<void> {
    await this.makeRequest(`/odata/Jobs(${key})/UiPath.Server.Configuration.OData.StopJob`, 'POST', { strategy }, folderId);
  }

  async restartJob(key: number, folderId?: number): Promise<void> {
    await this.makeRequest(`/odata/Jobs/UiPath.Server.Configuration.OData.RestartJob`, 'POST', { jobId: key }, folderId);
  }

  async resumeJob(key: number, folderId?: number): Promise<void> {
    await this.makeRequest(`/odata/Jobs/UiPath.Server.Configuration.OData.ResumeJob`, 'POST', { jobId: key }, folderId);
  }

  // Processes
  async getProcesses(filters?: ProcessFilters, queryParams?: ODataQueryParams, folderId?: number): Promise<ODataResponse<ProcessDto>> {
    // Usar folderId do parâmetro ou do filtro
    const finalFolderId = folderId ?? filters?.folderId;
    const includeSubfolders = filters?.includeSubfolders ?? false;

    // Se não há folderId, buscar processos compartilhados (sem header de pasta)
    // Isso permite que os gráficos funcionem mesmo sem pasta selecionada
    if (!finalFolderId) {
      // Buscar processos compartilhados diretamente da API
      const response = await this.makeRequest<ODataResponse<ProcessDto>>(
        '/odata/Processes',
        'GET',
        undefined,
        undefined, // Sem folderId = busca processos compartilhados
        queryParams
      );
      return response;
    }

    // IMPORTANTE: No UiPath, Processes são compartilhados entre pastas.
    // Para obter processos específicos de uma pasta, precisamos buscar através dos Releases.

    // Se includeSubfolders está ativado e temos um folderId, buscar processos de todas as subpastas
    if (includeSubfolders && finalFolderId) {
      const subfolderIds = await this.getSubfolderIds(finalFolderId);
      
      // Se não há subpastas (apenas a pasta pai), fazer apenas uma requisição
      if (subfolderIds.length === 1 && subfolderIds[0] === finalFolderId) {
        // Continuar com o comportamento padrão abaixo
      } else {
        // Fazer requisições para cada pasta através dos Releases e consolidar resultados
        const processKeys = new Set<string>(); // Coletar ProcessKeys únicos de todas as subpastas

        for (const subFolderId of subfolderIds) {
          try {
            
            // Buscar Releases (sem $expand)
            const releasesResponse = await this.makeRequest<ODataResponse<ReleaseDto>>(
              '/odata/Releases',
              'GET',
              undefined,
              subFolderId,
              {
                $select: 'ProcessKey,ProcessVersion,Name',
                $top: 1000, // Buscar muitos releases
              }
            );

            // Coletar ProcessKeys únicos
            if (releasesResponse.value) {
              releasesResponse.value.forEach(release => {
                if (release.ProcessKey) {
                  processKeys.add(release.ProcessKey);
                }
              });
            }
          } catch (error) {
            // Se uma pasta não tiver acesso ou não existir, continuar com as outras
            console.warn(`[getProcesses] Erro ao buscar Releases da pasta ${subFolderId}:`, error);
          }
        }

        // Agora buscar todos os Processes e filtrar pelos ProcessKeys encontrados
        let allProcesses: ProcessDto[] = [];
        if (processKeys.size > 0) {
          const allProcessesResponse = await this.makeRequest<ODataResponse<ProcessDto>>(
            '/odata/Processes',
            'GET',
            undefined,
            finalFolderId, // Usar a pasta pai para buscar
            {
              $top: 1000,
            }
          );

          // Filtrar apenas processos que têm Releases nas subpastas
          // O ProcessKey do Release é apenas o nome (ex: "1.0.Leitura.Glosa")
          // O Key do Process inclui a versão (ex: "1.0.Leitura.Glosa:1.0.5")
          const processKeysArrayForSubfolders = Array.from(processKeys);
          const filteredProcesses = (allProcessesResponse.value || []).filter(p => {
            // Verificar match exato primeiro
            if (processKeys.has(p.Key)) {
              return true;
            }
            // Verificar se o Process.Key começa com algum ProcessKey (match parcial)
            return processKeysArrayForSubfolders.some(pk => p.Key.startsWith(pk + ':'));
          });
          
          // Aplicar filtros adicionais
          let finalProcesses = filteredProcesses;
          if (filters?.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            finalProcesses = finalProcesses.filter(p => {
              const title = (p as any).Title || p.Name || '';
              const description = p.Description || '';
              return title.toLowerCase().includes(searchLower) ||
                     description.toLowerCase().includes(searchLower);
            });
          }

          allProcesses = finalProcesses;
        }

        // Retornar resposta consolidada
        return {
          '@odata.context': '',
          value: allProcesses,
          '@odata.count': allProcesses.length,
        } as ODataResponse<ProcessDto>;
      }
    }

    // Comportamento padrão: buscar processos através dos Releases da pasta
    // No UiPath, Processes são compartilhados, mas Releases são específicos por pasta
    // Estratégia: buscar Releases para obter ProcessKeys, depois buscar Processes por esses keys
    
    try {
      // Buscar Releases (sem $expand, pois não é suportado)
      const releasesResponse = await this.makeRequest<ODataResponse<ReleaseDto>>(
        '/odata/Releases',
        'GET',
        undefined,
        finalFolderId,
        {
          $select: 'ProcessKey,ProcessVersion,Name', // Buscar apenas campos necessários
          $top: queryParams?.$top || 1000, // Buscar muitos releases
        }
      );

      if (!releasesResponse.value || releasesResponse.value.length === 0) {
        console.log(`[getProcesses] Nenhum Release encontrado na pasta ${finalFolderId}`);
        return {
          '@odata.context': '',
          value: [],
          '@odata.count': 0,
        } as ODataResponse<ProcessDto>;
      }

      // Extrair ProcessKeys únicos dos Releases
      const processKeys = new Set<string>();
      releasesResponse.value.forEach(release => {
        if (release.ProcessKey) {
          processKeys.add(release.ProcessKey);
        }
      });

      const processKeysArray = Array.from(processKeys);

      // Buscar Processes usando os ProcessKeys encontrados
      // Como não podemos filtrar diretamente por múltiplos keys, vamos buscar todos e filtrar
      const allProcessesResponse = await this.makeRequest<ODataResponse<ProcessDto>>(
        '/odata/Processes',
        'GET',
        undefined,
        finalFolderId,
        {
          $top: 1000, // Buscar muitos processos
        }
      );

      // Filtrar apenas os processos que têm Releases nesta pasta
      // O ProcessKey do Release é apenas o nome (ex: "1.0.Leitura.Glosa")
      // O Key do Process inclui a versão (ex: "1.0.Leitura.Glosa:1.0.5")
      // Então precisamos verificar se o Process.Key começa com o ProcessKey do Release
      let filteredProcesses = (allProcessesResponse.value || []).filter(p => {
        // Verificar match exato primeiro
        if (processKeys.has(p.Key)) {
          return true;
        }
        
        // Verificar se o Process.Key começa com algum ProcessKey (match parcial)
        // Ex: "1.0.Leitura.Glosa:1.0.5" começa com "1.0.Leitura.Glosa"
        const foundMatch = processKeysArray.some(pk => p.Key.startsWith(pk + ':'));
        return foundMatch;
      });

      // Aplicar filtros adicionais se necessário
      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredProcesses = filteredProcesses.filter(p => {
          const title = (p as any).Title || p.Name || '';
          const description = p.Description || '';
          return title.toLowerCase().includes(searchLower) ||
                 description.toLowerCase().includes(searchLower);
        });
      }

      
      return {
        '@odata.context': '',
        value: filteredProcesses,
        '@odata.count': filteredProcesses.length,
      } as ODataResponse<ProcessDto>;
    } catch (error) {
      console.error(`[getProcesses] Erro ao buscar através de Releases:`, error);
      // Fallback: tentar buscar processos diretamente (pode retornar compartilhados)
      const finalQueryParams: ODataQueryParams & Record<string, any> = {
        ...queryParams,
        $filter: filters ? buildProcessFilter(filters) : queryParams?.$filter,
      };

      if (filters?.searchTerm) finalQueryParams.searchTerm = filters.searchTerm;
      if (filters?.feedId) finalQueryParams.feedId = filters.feedId;

      const response = await this.makeRequest<ODataResponse<ProcessDto>>('/odata/Processes', 'GET', undefined, finalFolderId, finalQueryParams);
      return response;
    }
  }

  async getProcessByKey(key: string): Promise<ProcessDto> {
    return this.makeRequest<ProcessDto>(`/odata/Processes('${key}')`);
  }

  async getProcessVersions(processId: string): Promise<ProcessDto[]> {
    const data = await this.makeRequest<ODataResponse<ProcessDto>>(
      `/odata/Processes/UiPath.Server.Configuration.OData.GetProcessVersions(processId='${processId}')`
    );
    return data.value || [];
  }

  async getProcessArguments(key: string): Promise<any> {
    return this.makeRequest(`/odata/Processes/UiPath.Server.Configuration.OData.GetArguments(key='${key}')`);
  }

  // Releases
  async getReleases(queryParams?: ODataQueryParams, folderId?: number): Promise<ODataResponse<ReleaseDto>> {
    return this.makeRequest<ODataResponse<ReleaseDto>>('/odata/Releases', 'GET', undefined, folderId, queryParams);
  }

  async getReleaseByKey(key: string, folderId?: number): Promise<ReleaseDto> {
    return this.makeRequest<ReleaseDto>(`/odata/Releases('${key}')`, 'GET', undefined, folderId);
  }

  // Robots
  async getRobots(filters?: RobotFilters, queryParams?: ODataQueryParams, folderId?: number): Promise<ODataResponse<RobotDto>> {
    const finalQueryParams: ODataQueryParams = {
      ...queryParams,
      $filter: filters ? buildRobotFilter(filters) : queryParams?.$filter,
    };

    return this.makeRequest<ODataResponse<RobotDto>>('/odata/Robots', 'GET', undefined, folderId, finalQueryParams);
  }

  async getRobotByKey(key: number, folderId?: number): Promise<RobotDto> {
    return this.makeRequest<RobotDto>(`/odata/Robots(${key})`, 'GET', undefined, folderId);
  }

  // Sessions
  async getSessions(filters?: SessionFilters, queryParams?: ODataQueryParams, folderId?: number): Promise<ODataResponse<SessionDto>> {
    const finalQueryParams: ODataQueryParams = {
      ...queryParams,
      $filter: filters ? buildSessionFilter(filters) : queryParams?.$filter,
    };

    return this.makeRequest<ODataResponse<SessionDto>>('/odata/Sessions', 'GET', undefined, folderId, finalQueryParams);
  }

  async getSessionById(key: number, folderId?: number): Promise<SessionDto> {
    return this.makeRequest<SessionDto>(`/odata/Sessions(${key})`, 'GET', undefined, folderId);
  }

  // Machines
  async getMachines(queryParams?: ODataQueryParams, folderId?: number): Promise<ODataResponse<MachineDto>> {
    return this.makeRequest<ODataResponse<MachineDto>>('/odata/Machines', 'GET', undefined, folderId, queryParams);
  }

  async getMachineById(key: number, folderId?: number): Promise<MachineDto> {
    return this.makeRequest<MachineDto>(`/odata/Machines(${key})`, 'GET', undefined, folderId);
  }

  // Queues
  async getQueues(queryParams?: ODataQueryParams, folderId?: number): Promise<ODataResponse<QueueDefinitionDto>> {
    return this.makeRequest<ODataResponse<QueueDefinitionDto>>('/odata/QueueDefinitions', 'GET', undefined, folderId, queryParams);
  }

  async getQueueById(key: number, folderId?: number): Promise<QueueDefinitionDto> {
    return this.makeRequest<QueueDefinitionDto>(`/odata/QueueDefinitions(${key})`, 'GET', undefined, folderId);
  }

  async getQueueItems(queueId?: number, queryParams?: ODataQueryParams, folderId?: number): Promise<ODataResponse<QueueItemDto>> {
    const endpoint = queueId 
      ? `/odata/QueueDefinitions(${queueId})/QueueItems`
      : '/odata/QueueItems';
    return this.makeRequest<ODataResponse<QueueItemDto>>(endpoint, 'GET', undefined, folderId, queryParams);
  }
}

export const orchestratorService = new OrchestratorService();

