// game.js — inicialização, UI e eventos
(function(){
  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

  const STORAGE_KEY = 'gm_state_v1';

  document.addEventListener('DOMContentLoaded', ()=>{
    const btnComecar = qs('#btn-comecar');
    const telaInicial = qs('#tela-inicial');
    const telaJogo = qs('#tela-jogo');
    const btnVoltar = qs('#btn-voltar');

    const formulas = window.FormulasRegistry;
    const visual = window.Visualizacoes;

    const selectFormula = qs('#select-formula');
    const zoomRange = qs('#zoom-range');
    const zoomValue = qs('#zoom-value');

    const desafioEnunciado = qs('#desafio-enunciado');
    const btnGerarDesafio = qs('#btn-gerar-desafio');
    const btnVerificarDesafio = qs('#btn-verificar-desafio');
    const desafioEntrada = qs('#desafio-entrada');
    const desafioFeedback = qs('#desafio-feedback');
    const desafioProgresso = qs('#desafio-progresso');

    visual.init('canvas-circulo');

    // carregar estado salvo (se existir)
    const saved = loadState();

    btnComecar.addEventListener('click', ()=>{
      telaInicial.classList.add('hidden');
      telaJogo.classList.remove('hidden');
      populateFormulaSelect();
      const defaultId = saved && saved.lastFormulaId ? saved.lastFormulaId : 'area_circulo';
      selectFormula.value = defaultId;
      loadFormula(defaultId, saved);
    });

    btnVoltar.addEventListener('click', ()=>{
      telaJogo.classList.add('hidden');
      telaInicial.classList.remove('hidden');
    });

    zoomRange.addEventListener('input', ()=>{
      const v = Number(zoomRange.value) || 1;
      zoomValue.textContent = Math.round(v*100) + '%';
      visual.setZoom(v);
      // redraw current radius if present
      const currentRInput = qs('#var-r');
      if(currentRInput) visual.drawCircle(Number(currentRInput.value) || 0);
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

    // desafio state
    let currentDesafio = null; // { formulaId, values: {}, answer }
    let progress = (saved && saved.progress) ? saved.progress : { attempts: 0, correct: 0 };
    updateDesafioProgresso();

    btnGerarDesafio.addEventListener('click', ()=>{
      const currentFormulaId = selectFormula.value;
      currentDesafio = gerarDesafioParaFormula(currentFormulaId);
      if(!currentDesafio) return;
      // preencher enunciado
      desafioEnunciado.textContent = currentDesafio.enunciado;
      desafioEntrada.value = '';
      desafioFeedback.textContent = '';
      // preenche inputs do jogo com os valores usados no desafio (facilita visualização)
      if(currentDesafio.values && currentDesafio.values.r !== undefined){
        const rInput = qs('#var-r');
        if(rInput){
          rInput.value = currentDesafio.values.r;
          rInput.dispatchEvent(new Event('input'));
        }
      }
    });

    btnVerificarDesafio.addEventListener('click', ()=>{
      if(!currentDesafio){
        desafioFeedback.textContent = 'Gere um desafio antes de verificar.';
        return;
      }
      const userRaw = desafioEntrada.value.trim();
      if(userRaw === ''){ desafioFeedback.textContent = 'Informe sua resposta.'; return; }
      const userNum = Number(userRaw);
      if(Number.isNaN(userNum)){ desafioFeedback.textContent = 'Valor inválido.'; return; }

      const verdade = currentDesafio.answer;
      const ok = checarResposta(userNum, verdade);
      progress.attempts += 1;
      if(ok){ progress.correct += 1; desafioFeedback.textContent = 'Correto! 🎉'; }
      else { desafioFeedback.textContent = `Incorreto. Resultado correto: ${formatPresentation(verdade)}`; }
      updateDesafioProgresso();
      saveState();
    });

    function updateDesafioProgresso(){
      desafioProgresso.textContent = `Acertos: ${progress.correct} | Tentativas: ${progress.attempts}`;
    }

    function gerarDesafioParaFormula(formulaId){
      const formula = formulas.get(formulaId);
      if(!formula) return null;
      // por enquanto gerar desafio envolvendo as variáveis principais, exemplo usando r
      const v = formula.variaveis && formula.variaveis[0];
      const min = (v && v.min !== undefined) ? v.min : 1;
      const max = (v && v.max !== undefined) ? v.max : 20;
      // escolher valor aleatório inteiro ou com step
      const step = (v && v.step) ? v.step : 1;
      const rand = randomInRange(min, max, step);
      const values = {};
      values[v.key] = rand;

      // enunciado dependendo do formula
      let enunciado = '';
      let answer = null;
      if(formulaId === 'area_circulo'){
        enunciado = `Um terreno circular possui raio de ${rand} ${v.unidade || 'unidades'}. Qual é sua área?`;
        answer = formula.calcular(values);
      } else if(formulaId === 'perimetro_circulo'){
        enunciado = `Um círculo tem raio de ${rand} ${v.unidade || 'unidades'}. Qual é seu perímetro?`;
        answer = formula.calcular(values);
      } else {
        enunciado = `Calcule o resultado para ${v.nome} = ${rand}`;
        answer = formula.calcular(values);
      }

      return { formulaId, values, enunciado, answer };
    }

    function randomInRange(min, max, step){
      const steps = Math.floor((max - min) / step) + 1;
      const i = Math.floor(Math.random() * steps);
      return Number((min + i * step).toFixed(6));
    }

    function checarResposta(user, truth){
      if(truth === 0) return Math.abs(user - truth) < 1e-6;
      const absDiff = Math.abs(user - truth);
      const rel = absDiff / Math.abs(truth);
      // aceitar 2% de erro relativo ou 0.1 de erro absoluto
      return rel <= 0.02 || absDiff <= 0.1;
    }

    function formatPresentation(value){
      return Number(value).toFixed(2).replace('.', ',');
    }

    function loadFormula(id, savedState){
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
        input.step = v.step || 'any';
        input.placeholder = v.nome;
        input.id = `var-${v.key}`;
        input.dataset.key = v.key;
        input.classList.add('primary-input'); // marcar como input principal

        controls.appendChild(input);

        // Se for raio e visualização de círculo, adicionar slider and presets
        let inputRange = null;
        if(formula.tipoVisualizacao === 'circulo' && v.key === 'r'){
          inputRange = document.createElement('input');
          inputRange.type = 'range';
          inputRange.min = (v.min !== undefined) ? v.min : 0;
          inputRange.max = (v.max !== undefined) ? v.max : 100;
          inputRange.step = (v.step !== undefined) ? v.step : 0.1;
          inputRange.value = inputRange.min;
          inputRange.className = 'range-input';
          inputRange.dataset.key = v.key;

          // sincronizar range -> number
          inputRange.addEventListener('input', ()=>{
            input.value = inputRange.value;
            input.dispatchEvent(new Event('input'));
          });

          controls.appendChild(inputRange);

          // presets
          const presets = (v.presets && Array.isArray(v.presets)) ? v.presets : [1,5,10];
          const presDiv = document.createElement('div');
          presDiv.className = 'presets';
          presets.forEach(p => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'preset-btn';
            b.textContent = p;
            b.addEventListener('click', ()=>{
              input.value = p;
              if(inputRange) inputRange.value = p;
              input.dispatchEvent(new Event('input'));
            });
            presDiv.appendChild(b);
          });
          controls.appendChild(presDiv);
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
            if(inputRange && inputRange.value !== String(input.value)) inputRange.value = input.value || inputRange.min;
          }
        });

        // se tinha estado salvo, restaurar
        if(savedState && savedState.lastValues && savedState.lastValues[v.key] !== undefined){
          input.value = savedState.lastValues[v.key];
          if(inputRange) inputRange.value = savedState.lastValues[v.key];
        }
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
        const apresentacao = formatPresentation(resultadoInterno);

        qs('#resultado-valor').textContent = `${apresentacao}`;
        qs('#resultado-explicacao').textContent = formula.explicacaoResultado ? formula.explicacaoResultado(values, resultadoInterno) : '';
        qs('#visual-area').textContent = (formula.id === 'area_circulo') ? `Área: ${apresentacao}` : `Valor: ${apresentacao}`;

        // atualizar visualização final
        if(formula.tipoVisualizacao === 'circulo'){
          visual.drawCircle(values.r);
        }

        // salvar estado
        const state = loadState() || {};
        state.lastFormulaId = formula.id;
        state.lastValues = values;
        state.lastResult = resultadoInterno;
        state.progress = progress;
        saveState(state);

        window.lastResult = { formulaId: formula.id, values, resultadoInterno };
      };

      // Desenhar estado inicial com valor padrão (restaurado ou 0)
      const restoredR = (savedState && savedState.lastValues && savedState.lastValues.r !== undefined) ? savedState.lastValues.r : 0;
      visual.drawCircle(restoredR);
      qs('#visual-raio').textContent = restoredR ? `Raio: ${restoredR}` : 'Raio: —';
      qs('#visual-area').textContent = 'Área: —';
      qs('#resultado-valor').textContent = '—';
      qs('#resultado-explicacao').textContent = formula.exemplo || '';

      // reset desafio UI when swapping formulas
      currentDesafio = null;
      desafioEnunciado.textContent = 'Clique em "Gerar desafio" para começar';
      desafioEntrada.value = '';
      desafioFeedback.textContent = '';
    }

    function saveState(state){
      try{
        const s = state || loadState() || {};
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      }catch(e){ console.warn('Não foi possível salvar estado:', e); }
    }

    function loadState(){
      try{
        const raw = localStorage.getItem(STORAGE_KEY);
        if(!raw) return null;
        return JSON.parse(raw);
      }catch(e){ return null; }
    }

  });

  // util
  function formatPresentation(value){
    return Number(value).toFixed(2).replace('.', ',');
  }

})();
