// src/modules/FormulasRegistry.js
// Sistema de registro de fórmulas com suporte a extensão

export class FormulasRegistry {
  constructor() {
    this.formulas = {};
  }

  /**
   * Registra uma nova fórmula no sistema
   * @param {Object} formula - Objeto com definição da fórmula
   * @throws {Error} Se fórmula inválida ou ID duplicado
   */
  add(formula) {
    if (!formula || !formula.id) {
      throw new Error('Fórmula inválida: falta propriedade "id"');
    }

    if (this.formulas[formula.id]) {
      throw new Error(`Fórmula com id "${formula.id}" já existe`);
    }

    // Validar estrutura mínima
    const required = ['nome', 'categoria', 'formula', 'descricao', 'variaveis', 'calcular'];
    for (const prop of required) {
      if (!(prop in formula)) {
        throw new Error(`Fórmula falta propriedade obrigatória: "${prop}"`);
      }
    }

    this.formulas[formula.id] = formula;
  }

  /**
   * Obtém uma fórmula por ID
   * @param {string} id - ID da fórmula
   * @returns {Object|null} Fórmula ou null se não encontrada
   */
  get(id) {
    return this.formulas[id] || null;
  }

  /**
   * Lista todas as fórmulas registradas
   * @returns {Array} Array com todas as fórmulas
   */
  list() {
    return Object.values(this.formulas);
  }

  /**
   * Obtém fórmulas filtradas por categoria
   * @param {string} categoria - Nome da categoria
   * @returns {Array} Fórmulas da categoria
   */
  getByCategory(categoria) {
    return this.list().filter(f => f.categoria === categoria);
  }

  /**
   * Remove uma fórmula
   * @param {string} id - ID da fórmula
   * @returns {boolean} true se removida, false se não encontrada
   */
  remove(id) {
    if (this.formulas[id]) {
      delete this.formulas[id];
      return true;
    }
    return false;
  }

  /**
   * Limpa todas as fórmulas (útil para testes)
   */
  clear() {
    this.formulas = {};
  }
}

// Exportar instância singleton
export const formulasRegistry = new FormulasRegistry();
