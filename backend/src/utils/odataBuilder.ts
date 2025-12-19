import { ODataQueryParams, JobFilters, ProcessFilters, RobotFilters, SessionFilters } from '../types/orchestrator';

export class ODataBuilder {
  private params: ODataQueryParams = {};

  filter(filter: string): this {
    this.params.$filter = filter;
    return this;
  }

  orderBy(orderBy: string): this {
    this.params.$orderby = orderBy;
    return this;
  }

  top(top: number): this {
    this.params.$top = top;
    return this;
  }

  skip(skip: number): this {
    this.params.$skip = skip;
    return this;
  }

  select(select: string): this {
    this.params.$select = select;
    return this;
  }

  expand(expand: string): this {
    this.params.$expand = expand;
    return this;
  }

  count(count: boolean = true): this {
    this.params.$count = count;
    return this;
  }

  build(): ODataQueryParams {
    return { ...this.params };
  }

  reset(): this {
    this.params = {};
    return this;
  }
}

export function buildJobFilter(filters: JobFilters): string {
  const conditions: string[] = [];

  if (filters.state) {
    if (Array.isArray(filters.state)) {
      const stateConditions = filters.state.map(s => `State eq '${s}'`).join(' or ');
      conditions.push(`(${stateConditions})`);
    } else {
      conditions.push(`State eq '${filters.state}'`);
    }
  }

  if (filters.releaseKey) {
    conditions.push(`Release/Key eq '${filters.releaseKey}'`);
  }

  if (filters.processKey) {
    // O Process.Key pode incluir versão (ex: "ProcessName:1.0.0")
    // Mas Release.ProcessKey é apenas o nome (ex: "ProcessName")
    // Então precisamos extrair apenas a parte do nome se houver versão
    const processKeyForFilter = filters.processKey.includes(':') 
      ? filters.processKey.split(':')[0] 
      : filters.processKey;
    conditions.push(`Release/ProcessKey eq '${processKeyForFilter}'`);
  }

  if (filters.robotId) {
    conditions.push(`Robot/Id eq ${filters.robotId}`);
  }

  if (filters.machineId) {
    conditions.push(`Robot/MachineId eq ${filters.machineId}`);
  }

  if (filters.startDate) {
    conditions.push(`StartTime ge ${filters.startDate}`);
  }

  if (filters.endDate) {
    conditions.push(`StartTime le ${filters.endDate}`);
  }

  return conditions.join(' and ');
}

export function buildProcessFilter(filters: ProcessFilters): string {
  const conditions: string[] = [];

  if (filters.feedId) {
    conditions.push(`FeedId eq ${filters.feedId}`);
  }

  if (filters.searchTerm) {
    conditions.push(`(contains(Title, '${filters.searchTerm}') or contains(Description, '${filters.searchTerm}'))`);
  }

  return conditions.join(' and ');
}

export function buildRobotFilter(filters: RobotFilters): string {
  const conditions: string[] = [];

  if (filters.state) {
    if (Array.isArray(filters.state)) {
      const stateConditions = filters.state.map(s => `State eq '${s}'`).join(' or ');
      conditions.push(`(${stateConditions})`);
    } else {
      conditions.push(`State eq '${filters.state}'`);
    }
  }

  if (filters.machineId) {
    conditions.push(`MachineId eq ${filters.machineId}`);
  }

  return conditions.join(' and ');
}

export function buildSessionFilter(filters: SessionFilters): string {
  const conditions: string[] = [];

  if (filters.state) {
    if (Array.isArray(filters.state)) {
      const stateConditions = filters.state.map(s => `State eq '${s}'`).join(' or ');
      conditions.push(`(${stateConditions})`);
    } else {
      conditions.push(`State eq '${filters.state}'`);
    }
  }

  if (filters.robotId) {
    conditions.push(`Robot/Id eq ${filters.robotId}`);
  }

  if (filters.machineId) {
    conditions.push(`Robot/MachineId eq ${filters.machineId}`);
  }

  return conditions.join(' and ');
}

export function encodeODataQuery(params: ODataQueryParams): string {
  const queryParts: string[] = [];

  if (params.$filter) {
    queryParts.push(`$filter=${encodeURIComponent(params.$filter)}`);
  }

  if (params.$orderby) {
    queryParts.push(`$orderby=${encodeURIComponent(params.$orderby)}`);
  }

  if (params.$top !== undefined) {
    queryParts.push(`$top=${params.$top}`);
  }

  if (params.$skip !== undefined) {
    queryParts.push(`$skip=${params.$skip}`);
  }

  if (params.$select) {
    queryParts.push(`$select=${encodeURIComponent(params.$select)}`);
  }

  if (params.$expand) {
    // $expand pode ter múltiplos valores separados por vírgula
    // Codificar cada parte separadamente se necessário
    queryParts.push(`$expand=${encodeURIComponent(params.$expand)}`);
  }

  if (params.$count !== undefined) {
    queryParts.push(`$count=${params.$count}`);
  }

  return queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
}

