// visualizacoes.js — lógica de desenho e canvas
(function(){
  const visual = {
    canvas: null,
    ctx: null,
    init(canvasId){
      this.canvas = document.getElementById(canvasId);
      if(!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', ()=> this.resize());
    },
    resize(){
      if(!this.canvas || !this.ctx) return;
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      // ajustar tamanho real do canvas
      this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      this.canvas.height = Math.max(1, Math.floor((rect.height || 300) * dpr));

      // Reset transform antes de aplicar escala — evita acumular escalas em múltiplos redimensionamentos
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      this.clear();
    },
    clear(){
      if(!this.ctx) return;
      const ctx = this.ctx;
      // limpar usando as dimensões em CSS pixels
      const cw = this.canvas.width / (window.devicePixelRatio || 1);
      const ch = this.canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0,0,cw,ch);
    },
    // Desenha um círculo proporcional ao raio informado
    drawCircle(radius){
      if(!this.ctx || !this.canvas) return;
      const ctx = this.ctx;
      const dpr = window.devicePixelRatio || 1;
      const cw = this.canvas.width / dpr;
      const ch = this.canvas.height / dpr;
      ctx.save();
      ctx.clearRect(0,0,cw,ch);

      const cx = cw / 2;
      const cy = ch / 2;

      // Define escala: queremos que o círculo caiba no canvas com folga
      const padding = 20;
      const maxDrawable = Math.min(cx, cy) - padding;

      const r = Math.max(0, Number(radius));
      // Evitar divisão por zero e mapear raio real para pixels
      const drawR = (r === 0) ? 6 : Math.min(maxDrawable, r);

      // Se r for maior que maxDrawable, queremos reduzir proporcionalmente para caber
      const finalR = (r > maxDrawable && r !== 0) ? maxDrawable : drawR;

      // Fundo sutil
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(0,0,cw,ch);

      // Círculo
      ctx.beginPath();
      ctx.arc(cx, cy, finalR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(79,70,229,0.15)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(79,70,229,0.9)';
      ctx.stroke();

      // Raio (linha)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + finalR, cy);
      ctx.strokeStyle = 'rgba(16,185,129,0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Marca o ponto final do raio
      ctx.beginPath();
      ctx.arc(cx + finalR, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16,185,129,1)';
      ctx.fill();

      // Texto do raio
      ctx.fillStyle = 'rgba(230,238,248,0.95)';
      ctx.font = '14px sans-serif';
      ctx.fillText(`r = ${radius}`, cx + finalR + 8, cy + 5);

      ctx.restore();
    }
  };

  window.Visualizacoes = visual;
})();
