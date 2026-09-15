// src/modules/formulas.js
// Registro padrão de fórmulas educativas

import { formulasRegistry } from './FormulasRegistry.js';

/**
 * Registra as fórmulas padrão do sistema
 * Pode ser estendido com mais fórmulas
 */
export function registerDefaultFormulas() {
  // Área do círculo
  formulasRegistry.add({
    id: 'area_circulo',
    nome: 'Área do círculo',
    categoria: 'Geometria',
    formula: 'A = π × r²',
    descricao: 'Calcula a área de um círculo a partir do raio.',
    variaveis: [
      {
        key: 'r',
        nome: 'raio',
        descricao: 'Raio do círculo',
        unidade: 'unidades',
        min: 0,
        max: 100,
        step: 0.1,
        presets: [1, 5, 10]
      }
    ],
    calcular(values) {
      const r = Number(values.r);
      return Math.PI * r * r;
    },
    explicacaoResultado(values, resultado) {
      return `A área é calculada como π × r². Com r = ${values.r}, A = π × ${values.r}² = ${resultado}`;
    },
    exemplo: 'Ex: r = 5 → A = π × 5² ≈ 78,54',
    tipoVisualizacao: 'circulo',
    // Nova API: geração de desafios
    gerarDesafio(values) {
      return {
        enunciado: `Um terreno circular possui raio de ${values.r} unidades. Qual é sua área?`,
        resposta: this.calcular(values)
      };
    }
  });

  // Perímetro do círculo
  formulasRegistry.add({
    id: 'perimetro_circulo',
    nome: 'Perímetro do círculo',
    categoria: 'Geometria',
    formula: 'P = 2 × π × r',
    descricao: 'Calcula o perímetro (circunferência) de um círculo a partir do raio.',
    variaveis: [
      {
        key: 'r',
        nome: 'raio',
        descricao: 'Raio do círculo',
        unidade: 'unidades',
        min: 0,
        max: 200,
        step: 0.1,
        presets: [1, 5, 10]
      }
    ],
    calcular(values) {
      const r = Number(values.r);
      return 2 * Math.PI * r;
    },
    explicacaoResultado(values, resultado) {
      return `O perímetro (circunferência) é 2πr. Com r = ${values.r}, P = 2 × π × ${values.r} = ${resultado}`;
    },
    exemplo: 'Ex: r = 5 → P = 2 × π × 5 ≈ 31,42',
    tipoVisualizacao: 'circulo',
    gerarDesafio(values) {
      return {
        enunciado: `Um círculo tem raio de ${values.r} unidades. Qual é seu perímetro?`,
        resposta: this.calcular(values)
      };
    }
  });

  // Área do quadrado
  formulasRegistry.add({
    id: 'area_quadrado',
    nome: 'Área do quadrado',
    categoria: 'Geometria',
    formula: 'A = l²',
    descricao: 'Calcula a área de um quadrado a partir do lado.',
    variaveis: [
      {
        key: 'l',
        nome: 'lado',
        descricao: 'Comprimento do lado',
        unidade: 'unidades',
        min: 0,
        max: 100,
        step: 0.1,
        presets: [2, 5, 10]
      }
    ],
    calcular(values) {
      const l = Number(values.l);
      return l * l;
    },
    explicacaoResultado(values, resultado) {
      return `A área é calculada como l². Com l = ${values.l}, A = ${values.l}² = ${resultado}`;
    },
    exemplo: 'Ex: l = 5 → A = 5² = 25',
    tipoVisualizacao: 'quadrado',
    gerarDesafio(values) {
      return {
        enunciado: `Um quadrado tem lado de ${values.l} unidades. Qual é sua área?`,
        resposta: this.calcular(values)
      };
    }
  });
}

export { formulasRegistry };
