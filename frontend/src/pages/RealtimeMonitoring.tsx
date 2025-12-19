import { useState, useEffect } from 'react';
import { useRealtimeMonitoring } from '@/hooks/useRealtimeMonitoring';
import { useMonitoringStore } from '@/store/monitoringStore';
import { useFilterStore } from '@/store/filterStore';
import JobsECGChart from '@/components/monitoring/JobsECGChart';
import RobotsECGChart from '@/components/monitoring/RobotsECGChart';
import SessionsECGChart from '@/components/monitoring/SessionsECGChart';
import QueuesECGChart from '@/components/monitoring/QueuesECGChart';
import ProcessesECGChart from '@/components/monitoring/ProcessesECGChart';
import PerformanceECGChart from '@/components/monitoring/PerformanceECGChart';
import FolderFilter from '@/components/filters/FolderFilter';
import { Activity, Pause, Play, RefreshCw, Wifi, WifiOff, Moon, Sun, X, Monitor, Info, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function RealtimeMonitoring() {
  const [isPaused, setIsPaused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Modo diurno por padrão
  const [showInstructions, setShowInstructions] = useState(true);
  const [observationMode, setObservationMode] = useState(false);
  const folderId = useFilterStore((state) => state.folderId);
  
  // Só inicia monitoramento se houver pasta selecionada e não estiver pausado
  const shouldMonitor = !isPaused && !!folderId;
  const { data, isLoading, isError, isOnline, refetch } = useRealtimeMonitoring(shouldMonitor);
  const { clearHistory } = useMonitoringStore();
  const latest = useMonitoringStore((state) => state.getLatest());

  // Fechar instruções ao selecionar pasta
  useEffect(() => {
    if (folderId && showInstructions) {
      // Opcional: fechar automaticamente após alguns segundos
      // setShowInstructions(false);
    }
  }, [folderId, showInstructions]);

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleClear = () => {
    if (confirm('Tem certeza que deseja limpar o histórico?')) {
      clearHistory();
    }
  };

  // Modo Observação - tela limpa, só gráficos
  if (observationMode) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100'
      }`}>
        {/* Botão flutuante para sair do modo observação */}
        <button
          onClick={() => setObservationMode(false)}
          className={`fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all ${
            isDarkMode
              ? 'bg-slate-800/90 hover:bg-slate-700 text-cyan-400 border border-slate-700'
              : 'bg-white/90 hover:bg-white text-blue-600 border border-slate-200'
          }`}
          title="Sair do modo observação"
        >
          <EyeOff className="h-5 w-5" />
        </button>

        {/* Gráficos ECG - Modo Observação */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <JobsECGChart darkMode={isDarkMode} />
            <RobotsECGChart darkMode={isDarkMode} />
            <SessionsECGChart darkMode={isDarkMode} />
            <QueuesECGChart darkMode={isDarkMode} />
            <ProcessesECGChart darkMode={isDarkMode} />
            <PerformanceECGChart darkMode={isDarkMode} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100'
    }`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-200'} backdrop-blur-sm border-b sticky top-0 z-50 shadow-lg`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold bg-gradient-to-r ${isDarkMode ? 'from-cyan-400 to-blue-500' : 'from-blue-600 to-purple-600'} bg-clip-text text-transparent flex items-center gap-2`}>
                <Activity className={`h-7 w-7 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`} />
                Monitoramento em Tempo Real
              </h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Visualização estilo ECG das métricas do Orchestrator
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Modo Observação */}
              <button
                onClick={() => setObservationMode(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isDarkMode
                    ? 'bg-slate-700 text-purple-400 hover:bg-slate-600'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
                title="Modo Observação - Tela limpa para TV"
              >
                <Monitor className="h-4 w-4" />
                <span className="text-sm font-medium">Modo Observação</span>
              </button>

              {/* Toggle Modo Noturno/Diurno */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isDarkMode
                    ? 'bg-slate-700 text-cyan-400 hover:bg-slate-600'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
                title={isDarkMode ? 'Alternar para modo diurno' : 'Alternar para modo noturno'}
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span className="text-sm font-medium">Diurno</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span className="text-sm font-medium">Noturno</span>
                  </>
                )}
              </button>
              {/* Status de conexão */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                {isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-red-400 font-medium">Offline</span>
                  </>
                )}
              </div>

              {/* Controles */}
              <Button
                onClick={handlePause}
                variant="outline"
                className={isDarkMode 
                  ? "bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Retomar
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </>
                )}
              </Button>

              <Button
                onClick={() => refetch()}
                variant="outline"
                className={isDarkMode 
                  ? "bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>

              <Button
                onClick={handleClear}
                variant="outline"
                className={isDarkMode 
                  ? "bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }
              >
                Limpar Histórico
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Instruções para o usuário */}
        {showInstructions && (
          <Card className={`mb-6 ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Info className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                      Como usar o Monitoramento em Tempo Real
                    </h3>
                    <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                      <li>• <strong>Selecione uma pasta</strong> no filtro abaixo para iniciar o monitoramento</li>
                      <li>• O monitoramento atualiza automaticamente a cada 10 segundos</li>
                      <li>• Use o <strong>Modo Observação</strong> para uma visualização limpa em telas/TVs</li>
                      <li>• Você pode alternar entre modo <strong>Diurno</strong> e <strong>Noturno</strong></li>
                      <li>• Use os botões <strong>Pausar</strong> e <strong>Atualizar</strong> para controlar o monitoramento</li>
                    </ul>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstructions(false)}
                  className={`p-1 rounded-lg transition-colors flex-shrink-0 ${
                    isDarkMode 
                      ? 'hover:bg-blue-800/50 text-blue-400' 
                      : 'hover:bg-blue-100 text-blue-600'
                  }`}
                  title="Fechar instruções"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Filtro de Pasta */}
        <div className="mb-6">
          <FolderFilter darkMode={isDarkMode} />
        </div>

        {/* Aviso se não houver pasta selecionada */}
        {!folderId && (
          <Card className={`mb-6 ${isDarkMode ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
            <div className="p-4">
              <p className={`flex items-center gap-2 ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
                <span className="text-lg">⚠️</span>
                <span>Selecione uma pasta acima para iniciar o monitoramento em tempo real.</span>
              </p>
            </div>
          </Card>
        )}

        {/* Métricas Atuais */}
        {latest && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <Card className={isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}>
              <div className="p-3">
                <p className={`text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Jobs Sucesso</p>
                <p className="text-2xl font-bold text-green-400">{latest.jobs.successful}</p>
              </div>
            </Card>
            <Card className={isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}>
              <div className="p-3">
                <p className={`text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Jobs Erro</p>
                <p className="text-2xl font-bold text-red-400">{latest.jobs.faulted}</p>
              </div>
            </Card>
            <Card className={isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}>
              <div className="p-3">
                <p className={`text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Robôs Disponíveis</p>
                <p className="text-2xl font-bold text-cyan-400">{latest.robots.available}</p>
              </div>
            </Card>
            <Card className={isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}>
              <div className="p-3">
                <p className={`text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Sessões Ativas</p>
                <p className="text-2xl font-bold text-blue-400">{latest.sessions.active}</p>
              </div>
            </Card>
            <Card className={isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}>
              <div className="p-3">
                <p className={`text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Queues Pendentes</p>
                <p className="text-2xl font-bold text-yellow-400">{latest.queues.pending}</p>
              </div>
            </Card>
            <Card className={isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}>
              <div className="p-3">
                <p className={`text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Throughput</p>
                <p className="text-2xl font-bold text-purple-400">{latest.performance.throughput.toFixed(1)}</p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>jobs/min</p>
              </div>
            </Card>
          </div>
        )}

        {/* Gráficos ECG */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <JobsECGChart darkMode={isDarkMode} />
          <RobotsECGChart darkMode={isDarkMode} />
          <SessionsECGChart darkMode={isDarkMode} />
          <QueuesECGChart darkMode={isDarkMode} />
          <ProcessesECGChart darkMode={isDarkMode} />
          <PerformanceECGChart darkMode={isDarkMode} />
        </div>

        {/* Loading State */}
        {isLoading && !latest && (
          <div className="mt-8 text-center">
            <div className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-cyan-400' : 'border-blue-600'}`}></div>
            <p className={`mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Carregando métricas...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card className={`mt-8 ${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
            <div className="p-4 text-center">
              <p className="text-red-400 font-medium">Erro ao carregar métricas</p>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>Verifique sua conexão e tente novamente</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

