// Tipos baseados na API do UiPath Orchestrator

export interface JobDto {
  Id: number;
  Key: string;
  State: JobState;
  StartTime?: string;
  EndTime?: string;
  Duration?: number;
  Release?: ReleaseDto;
  Robot?: RobotDto;
  Machine?: MachineDto;
  Info?: string;
  Source?: string;
  SourceType?: string;
  ReleaseKey?: string;
  ReleaseName?: string;
  RobotName?: string;
  MachineName?: string;
}

export type JobState = 
  | 'Pending'
  | 'Running'
  | 'Successful'
  | 'Faulted'
  | 'Canceled'
  | 'Stopping'
  | 'Terminating'
  | 'Resumed';

export interface ProcessDto {
  Key: string;
  Title?: string; // Campo correto conforme swagger (pode vir do $expand=Process)
  Name?: string; // Campo alternativo (pode não estar presente quando vem de Release.Process)
  Description?: string;
  Version?: string;
  IsLatestVersion?: boolean;
  IsProcessDeleted?: boolean;
  FeedId?: string;
  PackageId?: string;
}

export interface ReleaseDto {
  Key: string;
  ProcessKey: string;
  ProcessVersion?: string;
  Name: string;
  EnvironmentId?: number;
  EnvironmentName?: string;
  InputArguments?: string;
  JobsCount?: number;
  Arguments?: Record<string, any>;
  Process?: ProcessDto;
  ProcessName?: string;
}

export interface RobotDto {
  Id: number;
  Key: string;
  Name: string;
  MachineId?: number;
  MachineName?: string;
  LicenseKey?: string;
  RobotEnvironments?: string[];
  State?: RobotState;
  HostingType?: string;
}

export type RobotState = 
  | 'Available'
  | 'Busy'
  | 'Disconnected'
  | 'Unresponsive';

export interface SessionDto {
  Id: number;
  Robot?: RobotDto;
  Machine?: MachineDto;
  State?: SessionState;
  JobExecutionTarget?: string;
  StartTime?: string;
  EndTime?: string;
  Duration?: number;
}

export type SessionState = 
  | 'Available'
  | 'Busy'
  | 'Disconnected'
  | 'Unresponsive';

export interface MachineDto {
  Id: number;
  Name: string;
  Type?: string;
  NonProductionSlots?: number;
  UnattendedSlots?: number;
  HeadlessSlots?: number;
  TestAutomationSlots?: number;
}

export type FolderType = 'Standard' | 'Personal' | 'Virtual' | 'Solution' | 'DebugSolution';
export type FeedType = 'Undefined' | 'Processes' | 'Libraries' | 'PersonalWorkspace' | 'FolderHierarchy';

export interface FolderDto {
  Id: number;
  Key: string;
  DisplayName: string;
  FullyQualifiedName?: string;
  Description?: string;
  ParentId?: number;
  ParentKey?: string;
  FolderType?: FolderType;
  FeedType?: FeedType;
  IsPersonal?: boolean;
}

export interface CountStats {
  title: string;
  count: number;
}

export interface LicenseStatsModel {
  Date: string;
  Available: number;
  Used: number;
  Total: number;
}

export interface ConsumptionLicenseStatsModel {
  Date: string;
  Consumption: number;
}

export interface ODataResponse<T> {
  '@odata.context'?: string;
  value: T[];
  '@odata.count'?: number;
}

export interface ODataValue<T> {
  '@odata.context'?: string;
  value: T;
}

export interface ODataQueryParams {
  $filter?: string;
  $orderby?: string;
  $top?: number;
  $skip?: number;
  $select?: string;
  $expand?: string;
  $count?: boolean;
}

export interface JobFilters {
  folderId?: number;
  processKey?: string;
  releaseKey?: string;
  robotId?: number;
  state?: JobState | JobState[];
  startDate?: string;
  endDate?: string;
  machineId?: number;
}

export interface ProcessFilters {
  folderId?: number;
  includeSubfolders?: boolean;
  feedId?: string;
  searchTerm?: string;
}

export interface RobotFilters {
  folderId?: number;
  state?: RobotState | RobotState[];
  machineId?: number;
}

export interface SessionFilters {
  folderId?: number;
  robotId?: number;
  state?: SessionState | SessionState[];
  machineId?: number;
}

// Queue Types
export interface QueueDefinitionDto {
  Id: number;
  Name: string;
  Description?: string;
  MaxNumberOfRetries?: number;
  AcceptAutomaticallyRetry?: boolean;
  EnforceUniqueReference?: boolean;
  Created?: string;
  Updated?: string;
}

export interface QueueItemDto {
  Id: number;
  QueueDefinitionId?: number;
  QueueDefinition?: QueueDefinitionDto;
  Status?: QueueItemStatus;
  Priority?: string;
  Reference?: string;
  SpecificContent?: any;
  OutputData?: any;
  Progress?: string;
  StartProcessing?: string;
  EndProcessing?: string;
  RetryCount?: number;
  ExceptionType?: string;
  ExceptionReason?: string;
  CreationTime?: string;
  LastModified?: string;
}

export type QueueItemStatus = 
  | 'New'
  | 'InProgress'
  | 'Failed'
  | 'Successful'
  | 'Abandoned'
  | 'Retried'
  | 'Deleted';

// Realtime Monitoring Types
export interface RealtimeMetricsDto {
  timestamp: string;
  jobs: {
    successful: number;
    faulted: number;
    canceled: number;
    running: number;
    pending: number;
  };
  robots: {
    available: number;
    busy: number;
    disconnected: number;
    unresponsive: number;
  };
  sessions: {
    active: number;
  };
  queues: {
    pending: number;
    processed: number;
    failed: number;
  };
  processes: {
    running: number;
  };
  performance: {
    avgExecutionTime: number; // em segundos
    throughput: number; // jobs por minuto
  };
}

