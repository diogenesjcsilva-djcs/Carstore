/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  quilometragem: number;
  cor?: string;
  descricaoExperiencia?: string;
  tags: string[];
  dataCadastro: string;
}

export interface AuthResponse {
  token: string;
  username: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface SearchParams {
  marca?: string;
  precoMin?: number;
  precoMax?: number;
  anoMin?: number;
  anoMax?: number;
  tag?: string;
}
