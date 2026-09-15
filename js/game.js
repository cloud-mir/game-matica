// game.js — inicialização, UI e eventos
(function(){
  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

  document.addEventListener('DOMContentLoaded', ()=>{
    const btnComecar = qs('#btn-comecar');
    const telaInicial = qs('#tela-inicial');
    const telaJogo = qs('#tela-jogo');
    const btnVoltar = qs('#btn-voltar');

    const formulas = window.FormulasRegistry;
    const visual = window.Visualizacoes;

    visual.init('canvas-circulo');

    btnComecar.addEventListener('click', ()=>{
      telaInicial.classList.add('hidden');
      telaJogo.classList.remove('hidden');
      loadFormula('area_circulo');
    });

    btnVoltar.addEventListener('click', ()=>{
      telaJogo.classList.add('hidden');
      telaInicial.classList.remove('hidden');
    });

    function loadFormula(id){
      const formula = formulas.get(id);
      if(!formula) return;

      qs('#formula-nome').textContent = formula.nome;
      qs('#formula-expressao').textContent = formula.formula;
      qs('#formula-descricao').textContent = formula.descricao;

      const wrapper = qs('#variaveis-wrapper');
      wrapper.innerHTML = '';

      // Criar inputs para variáveis
      formula.variaveis.forEach(v => {
        const div = document.createElement('div');
        div.className = 'var-item';
        const label = document.createElement('label');
        label.textContent = `${v.nome} (${v.unidade || ''})`;
        const input = document.createElement('input');
        input.type = 'number';
        input.step = 'any';
        input.placeholder = v.nome;
        input.id = `var-${v.key}`;
        input.dataset.key = v.key;

        // mensagem de erro
        const err = document.createElement('div');
        err.className = 'error';
        err.style.display = 'none';

        div.appendChild(label);
        div.appendChild(input);
        div.appendChild(err);
        wrapper.appendChild(div);

        // Atualizar visualização enquanto digita
        input.addEventListener('input', ()=>{
          const val = parseFloat(input.value);
          if(formula.tipoVisualizacao === 'circulo' && v.key === 'r'){
            visual.drawCircle(isNaN(val) ? 0 : val);
            qs('#visual-raio').textContent = `Raio: ${isNaN(val) ? '—' : val}`;
          }
        });
      });

      // Botão calcular
      const btnCalc = qs('#btn-calcular');
      btnCalc.onclick = ()=>{
        // coletar valores
        const values = {};
        let valid = true;
        wrapper.querySelectorAll('input').forEach(input =>{
          const key = input.dataset.key;
          const err = input.parentElement.querySelector('.error');
          const raw = input.value.trim();
          if(raw === ''){
            valid = false;
            err.textContent = 'Informe um valor válido';
            err.style.display = 'block';
            return;
          }
          const num = Number(raw);
          if(Number.isNaN(num)){
            valid = false;
            err.textContent = 'Valor numérico inválido';
            err.style.display = 'block';
            return;
          }
          err.style.display = 'none';
          values[key] = num;
        });

        if(!valid) return;

        // efetuar cálculo (valor interno completo)
        const resultadoInterno = formula.calcular(values);

        // apresentação: arredondar para 2 casas e usar vírgula
        const apresentacao = Number(resultadoInterno).toFixed(2).replace('.', ',');

        qs('#resultado-valor').textContent = `${apresentacao}`;
        qs('#resultado-explicacao').textContent = formula.explicacaoResultado ? formula.explicacaoResultado(values, resultadoInterno) : '';
        qs('#visual-area').textContent = `Área: ${apresentacao}`;

        // atualizar visualização final
        if(formula.tipoVisualizacao === 'circulo'){
          visual.drawCircle(values.r);
        }

        // guardar (poderemos usar esse resultado no futuro para desafios)
        // Exemplo: window.lastResult = { formulaId: formula.id, values, resultadoInterno };
        window.lastResult = { formulaId: formula.id, values, resultadoInterno };
      };

      // Desenhar estado inicial com valor padrão 0
      visual.drawCircle(0);
      qs('#visual-raio').textContent = 'Raio: —';
      qs('#visual-area').textContent = 'Área: —';
      qs('#resultado-valor').textContent = '—';
      qs('#resultado-explicacao').textContent = formula.exemplo || '';
    }

  });
})();
