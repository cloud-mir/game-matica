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

    const selectFormula = qs('#select-formula');

    visual.init('canvas-circulo');

    btnComecar.addEventListener('click', ()=>{
      telaInicial.classList.add('hidden');
      telaJogo.classList.remove('hidden');
      populateFormulaSelect();
      // iniciar com a fórmula padrão
      const defaultId = 'area_circulo';
      selectFormula.value = defaultId;
      loadFormula(defaultId);
    });

    btnVoltar.addEventListener('click', ()=>{
      telaJogo.classList.add('hidden');
      telaInicial.classList.remove('hidden');
    });

    // Preenche o select com as fórmulas do registry
    function populateFormulaSelect(){
      const list = formulas.list();
      selectFormula.innerHTML = '';
      list.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = `${f.nome} (${f.categoria || 'Geral'})`;
        selectFormula.appendChild(opt);
      });

      selectFormula.addEventListener('change', ()=>{
        const id = selectFormula.value;
        loadFormula(id);
      });
    }

    function createPresetButtons(values, inputNumber, inputRange, wrapper){
      const presets = [1, 5, 10];
      const presDiv = document.createElement('div');
      presDiv.className = 'presets';
      presets.forEach(p => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'preset-btn';
        b.textContent = p;
        b.addEventListener('click', ()=>{
          inputNumber.value = p;
          if(inputRange) inputRange.value = p;
          // disparar input para atualizar visual
          inputNumber.dispatchEvent(new Event('input'));
        });
        presDiv.appendChild(b);
      });
      wrapper.appendChild(presDiv);
    }

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

        // Contêiner para controles (numero + range + presets)
        const controls = document.createElement('div');
        controls.className = 'var-controls';

        const input = document.createElement('input');
        input.type = 'number';
        input.step = 'any';
        input.placeholder = v.nome;
        input.id = `var-${v.key}`;
        input.dataset.key = v.key;
        input.classList.add('primary-input'); // marcar como input principal

        controls.appendChild(input);

        // Se for raio e visualização de círculo, adicionar slider e presets
        let inputRange = null;
        if(formula.tipoVisualizacao === 'circulo' && v.key === 'r'){
          inputRange = document.createElement('input');
          inputRange.type = 'range';
          inputRange.min = '0';
          inputRange.max = '100';
          inputRange.step = '0.1';
          inputRange.value = '0';
          inputRange.className = 'range-input';
          inputRange.dataset.key = v.key;

          // sincronizar range -> number
          inputRange.addEventListener('input', ()=>{
            input.value = inputRange.value;
            input.dispatchEvent(new Event('input'));
          });

          controls.appendChild(inputRange);

          // presets
          createPresetButtons(null, input, inputRange, controls);
        }

        // mensagem de erro
        const err = document.createElement('div');
        err.className = 'error';
        err.style.display = 'none';

        div.appendChild(label);
        div.appendChild(controls);
        div.appendChild(err);
        wrapper.appendChild(div);

        // Atualizar visualização enquanto digita
        input.addEventListener('input', ()=>{
          const val = parseFloat(input.value);
          if(formula.tipoVisualizacao === 'circulo' && v.key === 'r'){
            visual.drawCircle(isNaN(val) ? 0 : val);
            qs('#visual-raio').textContent = `Raio: ${isNaN(val) ? '—' : val}`;
            // manter range sincronizado se existir
            if(inputRange && inputRange.value !== String(input.value)) inputRange.value = input.value || '0';
          }
        });
      });

      // Botão calcular
      const btnCalc = qs('#btn-calcular');
      btnCalc.onclick = ()=>{
        // coletar valores — apenas inputs marcados como primary-input
        const values = {};
        let valid = true;
        wrapper.querySelectorAll('input.primary-input').forEach(input =>{
          const key = input.dataset.key;
          const err = input.parentElement.parentElement.querySelector('.error');
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
        qs('#visual-area').textContent = (formula.id === 'area_circulo') ? `Área: ${apresentacao}` : `Valor: ${apresentacao}`;

        // atualizar visualização final
        if(formula.tipoVisualizacao === 'circulo'){
          visual.drawCircle(values.r);
        }

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
