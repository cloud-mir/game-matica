// src/modules/Validator.js
// Sistema de validação com mensagens customizadas

export class Validator {
  /**
   * Valida um número dentro de um intervalo
   * @param {number} value - Valor a validar
   * @param {Object} variable - Objeto de variável com min, max
   * @returns {Object} { valid: boolean, error?: string }
   */
  static validateNumber(value, variable) {
    if (value === '' || value === null || value === undefined) {
      return { valid: false, error: 'Informe um valor' };
    }

    const num = Number(value);
    if (Number.isNaN(num)) {
      return { valid: false, error: 'Valor deve ser numérico' };
    }

    if (variable.min !== undefined && num < variable.min) {
      return { 
        valid: false, 
        error: `Valor deve ser no mínimo ${variable.min}` 
      };
    }

    if (variable.max !== undefined && num > variable.max) {
      return { 
        valid: false, 
        error: `Valor deve ser no máximo ${variable.max}` 
      };
    }

    return { valid: true };
  }

  /**
   * Valida todos os inputs de variáveis
   * @param {Array} variables - Array de variáveis
   * @param {Object} values - Objeto com valores de entrada
   * @returns {Object} { valid: boolean, errors: Object }
   */
  static validateFormula(variables, values) {
    const errors = {};
    let valid = true;

    for (const variable of variables) {
      const result = this.validateNumber(values[variable.key], variable);
      if (!result.valid) {
        errors[variable.key] = result.error;
        valid = false;
      }
    }

    return { valid, errors };
  }

  /**
   * Verifica se resposta está correta (com tolerância)
   * @param {number} userAnswer - Resposta do usuário
   * @param {number} correctAnswer - Resposta correta
   * @param {number} tolerance - Tolerância percentual (padrão 2%)
   * @returns {boolean}
   */
  static checkAnswer(userAnswer, correctAnswer, tolerance = 0.02) {
    if (correctAnswer === 0) {
      return Math.abs(userAnswer - correctAnswer) < 1e-6;
    }

    const absDiff = Math.abs(userAnswer - correctAnswer);
    const relError = absDiff / Math.abs(correctAnswer);
    const absErrorThreshold = 0.1;

    return relError <= tolerance || absDiff <= absErrorThreshold;
  }

  /**
   * Formata número para apresentação (2 casas decimais, vírgula)
   * @param {number} value - Valor a formatar
   * @returns {string}
   */
  static formatPresentation(value) {
    return Number(value).toFixed(2).replace('.', ',');
  }
}
