/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { readDatabase, writeDatabase } from "./server-db.js";
import { Veiculo } from "./src/types.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory session tokens
const SESSIONS = new Set<string>();

// Middleware to check authentication
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Acesso não autorizado. Faça login primeiro." });
    return;
  }
  const token = authHeader.split(" ")[1];
  if (!SESSIONS.has(token)) {
    res.status(401).json({ error: "Sessão inválida ou expirada." });
    return;
  }
  next();
}

// 1. AUTHENTICATION ROUTE
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  // Custom fixed admin login matching the AuthController.cs specification
  if (username === "admin" && password === "123456") {
    const token = `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    SESSIONS.add(token);
    res.json({ token, username });
    return;
  }
  
  res.status(401).json({ error: "Usuário ou senha inválidos." });
});

// Logout route
app.post("/api/auth/logout", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    SESSIONS.delete(token);
  }
  res.json({ success: true });
});

// 2. VEHICLE CRUD ROUTES

// GET: All vehicles
app.get("/api/veiculos", (req: Request, res: Response) => {
  const veiculos = readDatabase();
  res.json(veiculos);
});

// GET: Search / filter vehicles (api/veiculos/busca)
app.get("/api/veiculos/busca", (req: Request, res: Response) => {
  const veiculos = readDatabase();
  const { marca, precoMin, precoMax, anoMin, anoMax, tag } = req.query;

  let results = [...veiculos];

  if (marca && typeof marca === 'string' && marca.trim()) {
    const searchBrand = marca.toLowerCase();
    results = results.filter(v => 
      v.marca.toLowerCase().includes(searchBrand) || 
      v.modelo.toLowerCase().includes(searchBrand)
    );
  }

  if (precoMin) {
    const minVal = parseFloat(precoMin as string);
    if (!isNaN(minVal)) results = results.filter(v => v.preco >= minVal);
  }

  if (precoMax) {
    const maxVal = parseFloat(precoMax as string);
    if (!isNaN(maxVal)) results = results.filter(v => v.preco <= maxVal);
  }

  if (anoMin) {
    const minAno = parseInt(anoMin as string, 10);
    if (!isNaN(minAno)) results = results.filter(v => v.ano >= minAno);
  }

  if (anoMax) {
    const maxAno = parseInt(anoMax as string, 10);
    if (!isNaN(maxAno)) results = results.filter(v => v.ano <= maxAno);
  }

  if (tag && typeof tag === 'string' && tag.trim()) {
    const searchTag = tag.toLowerCase().trim();
    results = results.filter(v => v.tags.some(t => t.toLowerCase() === searchTag));
  }

  res.json(results);
});

// GET: Single vehicle by ID
app.get("/api/veiculos/:id", (req: Request, res: Response) => {
  const veiculos = readDatabase();
  const vehicle = veiculos.find(v => v.id === req.params.id);
  if (!vehicle) {
    res.status(404).json({ error: "Veículo não encontrado." });
    return;
  }
  res.json(vehicle);
});

// POST: Add a new vehicle (Auth Protected)
app.post("/api/veiculos", requireAuth, (req: Request, res: Response) => {
  const veiculos = readDatabase();
  const newVeiculo: Veiculo = {
    id: `car-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    marca: req.body.marca || "Desconhecida",
    modelo: req.body.modelo || "Modelo não especificado",
    ano: Number(req.body.ano) || new Date().getFullYear(),
    preco: Number(req.body.preco) || 0,
    quilometragem: Number(req.body.quilometragem) || 0,
    cor: req.body.cor || "Não especificada",
    descricaoExperiencia: req.body.descricaoExperiencia || "",
    tags: Array.isArray(req.body.tags) ? req.body.tags.map((t: string) => t.trim().toLowerCase()) : [],
    dataCadastro: new Date().toISOString()
  };

  veiculos.push(newVeiculo);
  writeDatabase(veiculos);

  res.status(201).json(newVeiculo);
});

// PUT: Edit an existing vehicle (Auth Protected)
app.put("/api/veiculos/:id", requireAuth, (req: Request, res: Response) => {
  const veiculos = readDatabase();
  const index = veiculos.findIndex(v => v.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: "Veículo não encontrado para atualização." });
    return;
  }

  const updatedVeiculo: Veiculo = {
    ...veiculos[index],
    marca: req.body.marca ?? veiculos[index].marca,
    modelo: req.body.modelo ?? veiculos[index].modelo,
    ano: req.body.ano !== undefined ? Number(req.body.ano) : veiculos[index].ano,
    preco: req.body.preco !== undefined ? Number(req.body.preco) : veiculos[index].preco,
    quilometragem: req.body.quilometragem !== undefined ? Number(req.body.quilometragem) : veiculos[index].quilometragem,
    cor: req.body.cor ?? veiculos[index].cor,
    descricaoExperiencia: req.body.descricaoExperiencia ?? veiculos[index].descricaoExperiencia,
    tags: Array.isArray(req.body.tags) ? req.body.tags.map((t: string) => t.trim().toLowerCase()) : veiculos[index].tags
  };

  veiculos[index] = updatedVeiculo;
  writeDatabase(veiculos);

  res.json(updatedVeiculo);
});

// DELETE: Remove a vehicle (Auth Protected)
app.delete("/api/veiculos/:id", requireAuth, (req: Request, res: Response) => {
  const veiculos = readDatabase();
  const filtered = veiculos.filter(v => v.id !== req.params.id);

  if (filtered.length === veiculos.length) {
    res.status(404).json({ error: "Veículo não encontrado." });
    return;
  }

  writeDatabase(filtered);
  res.json({ message: "Veículo removido com sucesso!" });
});

// 3. INTEGRATED AI SALES ASSISTANT CHAT ROUTE (Gemini API)
app.post("/api/ai/chat", async (req: Request, res: Response) => {
  const { messages } = req.body; // Array of ChatMessage
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Histórico de mensagens inválido ou ausente." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    res.status(503).json({ 
      error: "A chave API do Gemini não está configurada no servidor. Por favor, configure-a no painel de Segredos." 
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const veiculos = readDatabase();
    
    // Setup system instructions based on the real-time vehicle database state
    const systemInstruction = `Você é o assistente virtual de vendas inteligente da nossa revenda de automóveis "Loja de Veículos com IA". 
Seu objetivo é ajudar os clientes a encontrarem o carro perfeito, responder dúvidas técnicas ou gerais de forma entusiasmada, persuasiva e profissional.

Aqui está o nosso estoque de veículos em tempo real atualizado:
${JSON.stringify(veiculos, null, 2)}

Diretrizes de comportamento:
1. Atendimento em PORTUGUÊS (Brasil). Seja simpático, prestativo e persuasivo como um bom vendedor.
2. Analise a necessidade do cliente (ex: carro econômico, SUV espaçoso, esportivo potente) e indique ativamente os veículos do nosso estoque que batem com os filtros e tags.
3. Se o veículo sugerido tiver o campo "descricaoExperiencia", use-o para criar uma narrativa fascinante sobre dirigir aquele carro (sensação de luxo, economia, aventura, etc.).
4. Caso o cliente peça um modelo que não esteja em nosso estoque, explique de forma positiva que não temos esse modelo específico hoje, mas ofereça imediatamente uma ou duas alternativas semelhantes presentes no nosso estoque atual.
5. Mencione detalhes cruciais como preço, quilometragem, ano e cor para embasar suas propostas.
6. Sempre encoraje o cliente a marcar uma visita, agendar um test-drive ou falar com um vendedor humano.
7. Mantenha as mensagens organizadas e formatadas com tópicos e Markdown simples para facilitar a leitura.`;

    // Map frontend messages into Gemini contents structure
    // We only send the text content
    const contents = messages.map((m: any) => {
      return {
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const aiText = response.text || "Desculpe, tive uma oscilação no sinal. Pode repetir a pergunta?";
    res.json({ text: aiText });
  } catch (error: any) {
    console.error("Erro na integração com Gemini:", error);
    res.status(500).json({ 
      error: "Erro ao processar resposta com a Inteligência Artificial.",
      details: error.message 
    });
  }
});

// 4. VITE MIDDLEWARE / STATIC ASSETS
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Loja de Veículos] Servidor rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
