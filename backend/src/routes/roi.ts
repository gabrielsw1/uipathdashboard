import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();
const ROI_CONFIG_FILE = path.join(process.cwd(), 'roi-config.json');

// GET - Carregar configuração
router.get('/config', async (req: Request, res: Response, next) => {
  try {
    if (fs.existsSync(ROI_CONFIG_FILE)) {
      const fileContent = fs.readFileSync(ROI_CONFIG_FILE, 'utf-8');
      const data = JSON.parse(fileContent);
      res.json(data);
    } else {
      // Retornar estrutura vazia se o arquivo não existir
      res.json({
        version: '1.0',
        robotHourlyCost: 0,
        configs: [],
      });
    }
  } catch (error) {
    console.error('Erro ao carregar configuração ROI:', error);
    next(error);
  }
});

// POST - Salvar configuração
router.post('/config', async (req: Request, res: Response, next) => {
  try {
    const data = req.body;
    
    // Validar estrutura
    if (!data.version || typeof data.robotHourlyCost !== 'number' || !Array.isArray(data.configs)) {
      return res.status(400).json({ error: 'Estrutura de dados inválida' });
    }

    // Salvar arquivo
    fs.writeFileSync(ROI_CONFIG_FILE, JSON.stringify(data, null, 2), 'utf-8');
    
    res.json({ 
      success: true, 
      message: 'Configuração salva com sucesso',
      path: ROI_CONFIG_FILE 
    });
  } catch (error) {
    console.error('Erro ao salvar configuração ROI:', error);
    next(error);
  }
});

export default router;

