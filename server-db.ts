/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { Veiculo } from './src/types.js';

const DB_FILE = path.join(process.cwd(), 'veiculos.json');

const INITIAL_VEICULOS: Veiculo[] = [
  {
    id: "911-carrera-s-2021",
    marca: "Porsche",
    modelo: "911 Carrera S",
    ano: 2021,
    preco: 690000,
    quilometragem: 12000,
    cor: "Cinza Giz",
    descricaoExperiencia: "Um ícone atemporal das pistas adaptado para as ruas brasileiras. Este 911 Carrera S oferece uma condução esportiva purista incomparável, com motor boxer biturbo de 450 cv de potência e o lendário câmbio PDK de 8 marchas de trocas ultra-rápidas. O carro possui escape esportivo original, rodas Carrera Classic e interior em couro bicolor. Estado de conservação absolutamente impecável, revisado apenas na concessionária autorizada e com laudo cautelar 100% aprovado.",
    tags: ["esportivo", "luxo", "automatico"],
    dataCadastro: new Date().toISOString()
  },
  {
    id: "corolla-hybrid-2022",
    marca: "Toyota",
    modelo: "Corolla Altis Hybrid",
    ano: 2022,
    preco: 145000,
    quilometragem: 28000,
    cor: "Branco Pérola",
    descricaoExperiencia: "O sedã médio mais confiável e vendido do mundo na sua versão híbrida, oferecendo uma economia de combustível espetacular e condução silenciosa. O sistema híbrido inteligente regenera energia nas frenagens e entrega médias incríveis de até 20 km/l na cidade. Equipado com o pacote Toyota Safety Sense que inclui alerta de colisão, frenagem autônoma de emergência, controle de cruzeiro adaptativo (ACC) e faróis de LED adaptativos. Único dono, todas as revisões feitas por tempo na concessionária, garantindo a tranquilidade que você merece.",
    tags: ["economico", "familia", "hibrido", "conforto"],
    dataCadastro: new Date().toISOString()
  },
  {
    id: "compass-longitude-2020",
    marca: "Jeep",
    modelo: "Compass Longitude 2.0 Flex",
    ano: 2020,
    preco: 112000,
    quilometragem: 45000,
    cor: "Preto Carbono",
    descricaoExperiencia: "O SUV médio que conquistou o Brasil pelo seu porte robusto e acabamento superior. Esta versão Longitude oferece bancos de couro nobre, central multimídia gigante com espelhamento sem fio, ar-condicionado digital dual-zone e excelente altura livre do solo para superar obstáculos urbanos sem qualquer esforço. Perfeito para viagens longas em família pelo conforto acústico e excelente estabilidade nas curvas. Pneus novos e mecânica rigorosamente em dia.",
    tags: ["suv", "familia", "automatico"],
    dataCadastro: new Date().toISOString()
  },
  {
    id: "civic-touring-2019",
    marca: "Honda",
    modelo: "Civic Touring 1.5 Turbo",
    ano: 2019,
    preco: 128000,
    quilometragem: 52000,
    cor: "Azul Cósmico",
    descricaoExperiencia: "A versão topo de linha Touring do Civic é um verdadeiro espetáculo visual e de performance. Equipado com o excelente motor 1.5 Turbo acoplado ao câmbio CVT com simulação de marchas e paddle-shifts. Design marcante com teto solar elétrico, sistema LaneWatch (câmera de ponto cego integrada ao retrovisor), faróis full LED, bancos elétricos, painel digital e sistema de som premium de alta fidelidade com 10 alto-falantes. Ideal para quem valoriza sofisticação, dirigibilidade dinâmica e alto desempenho com consumo equilibrado.",
    tags: ["sedan", "esportivo", "automatico", "teto-solar"],
    dataCadastro: new Date().toISOString()
  },
  {
    id: "onix-premier-2021",
    marca: "Chevrolet",
    modelo: "Onix Premier 1.0 Turbo",
    ano: 2021,
    preco: 79000,
    quilometragem: 31000,
    cor: "Prata Switchblade",
    descricaoExperiencia: "O hatch mais tecnológico e seguro da categoria, premiado com 5 estrelas no Latin NCAP. A versão Premier é equipada com assistente de estacionamento automático (Easy Park), alerta de ponto cego nos retrovisores, carregador de smartphone por indução e conexão Wi-Fi nativa a bordo para até 7 dispositivos. Seu motor 1.0 Turbo é extremamente ágil nas saídas de semáforo e absurdamente econômico na cidade, entregando diversão na direção com baixo custo de manutenção.",
    tags: ["hatch", "economico", "turbo", "tecnologia"],
    dataCadastro: new Date().toISOString()
  }
];

export function readDatabase(): Veiculo[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDatabase(INITIAL_VEICULOS);
      return INITIAL_VEICULOS;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler banco de dados de veículos:", error);
    return INITIAL_VEICULOS;
  }
}

export function writeDatabase(data: Veiculo[]): boolean {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error("Erro ao salvar banco de dados de veículos:", error);
    return false;
  }
}
