# Game-Mática — Fórmulas na Prática

Projeto educativo para aprender matemática transformando fórmulas em interações e visualizações no navegador.

### Como executar

1. Clone o repositório:
   git clone https://github.com/cloud-mir/game-matica
2. Abra `index.html` no navegador (ou sirva com um servidor estático):
   python -m http.server 8000
   Abra http://localhost:8000

### Estrutura principal

projeto/
├── index.html
├── css/style.css
├── js/
│   ├── game.js
│   ├── formulas.js
│   └── visualizacoes.js
└── assets/
    ├── images/
    └── sounds/

### O que já está implementado (primeira versão)

- Tela inicial com botão "Começar".
- Sistema de registro de fórmulas (FormulasRegistry) para adicionar fórmulas sem alterar a lógica principal.
- Fórmulas implementadas:
  - `area_circulo` — Área do círculo (A = π × r²)
  - `perimetro_circulo` — Perímetro do círculo (P = 2 × π × r)
- Interface do jogo com exibição da fórmula, descrição, inputs das variáveis e validação de entrada.
- Visualização em Canvas que desenha o círculo e o raio; atualiza enquanto o usuário altera o raio.
- Slider e presets para entrada rápida do raio (sincronizados com o campo numérico).
- Resultado interno mantido com precisão completa; apresentação arredondada (2 casas decimais, vírgula como separador).

### Como adicionar novas fórmulas

Abra `js/formulas.js` e registre uma nova fórmula usando a API do registry:

```js
window.FormulasRegistry.add({
  id: 'minha_formula',
  nome: 'Nome da Fórmula',
  categoria: 'Categoria',
  formula: 'Expressão',
  descricao: 'O que faz a fórmula',
  variaveis: [ { key: 'x', nome: 'x', descricao: '...', unidade: 'unidades' } ],
  calcular(values){
    // values.x, values.y ...
    return /* número (não arredondar) */;
  },
  explicacaoResultado(values, resultado){
    return `Explicação textual do resultado`;
  },
  tipoVisualizacao: 'circulo' // ou outro tipo que você implemente
});
```

Após adicionar a fórmula, ela aparecerá automaticamente no seletor dentro do jogo.

### Próximos passos sugeridos

- Adicionar mais tipos de visualização (por exemplo: gráfico de barras, vetores).
- Criar sistema de desafios e checagem de respostas.
- Salvar progresso localmente (localStorage) ou preparar um backend para contas e progressão.

### Licença

MIT — veja o arquivo LICENSE no repositório.
