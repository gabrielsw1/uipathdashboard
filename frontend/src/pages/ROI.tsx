import { useState, useRef } from 'react';
import ROIConfigForm from '@/components/roi/ROIConfigForm';
import ROITable from '@/components/roi/ROITable';
import { useROIStore } from '@/store/roiStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Download, Upload, TrendingUp } from 'lucide-react';

export default function ROI() {
  const { exportToJSON, importFromJSON } = useROIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    try {
      const json = exportToJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'roi-config.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExporting(false);
      alert('Arquivo JSON exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar configurações. Por favor, tente novamente.');
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const success = importFromJSON(json);
        
        if (success) {
          alert('Configurações importadas com sucesso!');
        } else {
          alert('Erro ao importar configurações. Verifique se o arquivo está no formato correto.');
        }
      } catch (error) {
        console.error('Erro ao importar:', error);
        alert('Erro ao importar configurações. Por favor, verifique o arquivo.');
      }
    };
    reader.readAsText(file);
    
    // Limpar input para permitir importar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <TrendingUp className="h-7 w-7" />
                Análise de ROI
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Calcule o retorno sobre investimento (ROI) dos processos automatizados
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON
              </Button>
              <Button variant="outline" onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                Importar JSON
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">

        {/* Informações */}
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Como funciona:</h3>
            <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>Configure o custo por hora do robô (parâmetro global aplicado a todos os processos)</li>
              <li>O custo do robô é calculado proporcionalmente: (custo/hora × 8760 horas/ano) × (período analisado / 8760)</li>
              <li>Cadastre o tempo manual e custo por hora da pessoa para cada pasta</li>
              <li>O sistema calcula automaticamente o ROI comparando o tempo automático vs manual</li>
              <li>O ROI considera o valor economizado com a pessoa menos o custo proporcional do robô</li>
              <li><strong>As configurações são salvas automaticamente</strong> no arquivo <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">roi-config.json</code> na pasta raiz do projeto</li>
              <li>Na próxima vez que abrir a página, as configurações serão carregadas automaticamente do arquivo</li>
              <li>Você também pode importar manualmente um arquivo JSON usando o botão "Importar JSON"</li>
            </ul>
          </div>
        </Card>

        {/* Formulário de Configuração */}
        <section className="mb-8">
          <ROIConfigForm />
        </section>

        {/* Tabela de Resultados */}
        <section className="mb-8">
          <ROITable />
        </section>
      </div>
    </div>
  );
}

