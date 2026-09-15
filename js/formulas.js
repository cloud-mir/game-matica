// formulas.js — registro e cadastro de fórmulas
(function(){
  // Simples registry global para fórmulas
  const registry = {
    formulas: {},
    add(formula){
      if(!formula || !formula.id) throw new Error('Fórmula inválida (falta id)');
      this.formulas[formula.id] = formula;
    },
    get(id){
      return this.formulas[id] || null;
    },
    list(){
      return Object.values(this.formulas);
    }
  };

  // Expor globalmente
  window.FormulasRegistry = registry;

  // Registrar a primeira fórmula: Área do círculo
  registry.add({
    id: 'area_circulo',
    nome: 'Área do círculo',
    categoria: 'Geometria',
    formula: 'A = π × r²',
    descricao: 'Calcula a área de um círculo a partir do raio.',
    variaveis: [
      { key: 'r', nome: 'raio', descricao: 'Raio do círculo (mesma unidade do resultado dividido por área ao quadrado)', unidade: 'unidades' }
    ],
    // calcular deve retornar o número com precisão completa (não arredondado)
    calcular(values){
      const r = Number(values.r);
      return Math.PI * r * r;
    },
    explicacaoResultado: function(values, resultado){
      return `A área é calculada como π × r². Com r = ${values.r}, A = π × ${values.r}² = ${resultado}`;
    },
    exemplo: 'Ex: r = 5 → A = π × 5² ≈ 78,54',
    tipoVisualizacao: 'circulo'
  });

})();
