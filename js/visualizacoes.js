// visualizacoes.js — lógica de desenho e canvas
(function(){
  const visual = {
    canvas: null,
    ctx: null,
    width: 600,
    height: 400,
    init(canvasId){
      this.canvas = document.getElementById(canvasId);
      if(!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', ()=> this.resize());
    },
    resize(){
      if(!this.canvas) return;
      // Manter resolução de desenho proporcional ao CSS size
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = Math.floor(rect.width * devicePixelRatio);
      this.canvas.height = Math.floor((rect.height || 300) * devicePixelRatio);
      this.ctx.scale(devicePixelRatio, devicePixelRatio);
      this.clear();
    },
    clear(){
      if(!this.ctx) return;
      const ctx = this.ctx;
      ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
    },
    // Desenha um círculo proporcional ao raio informado
    drawCircle(radius){
      if(!this.ctx) return;
      const ctx = this.ctx;
      // tamanho disponível (usando CSS pixels approximation)
      const cw = this.canvas.width / devicePixelRatio;
      const ch = this.canvas.height / devicePixelRatio;
      ctx.save();
      ctx.clearRect(0,0,cw,ch);

      const cx = cw / 2;
      const cy = ch / 2;

      // Define escala: queremos que o círculo caiba no canvas com folga
      const padding = 20;
      const maxDrawable = Math.min(cx, cy) - padding;

      // Se radius = 0, desenha ponto pequeno
      const r = Math.max(0, Number(radius));
      const scale = (r === 0) ? 1 : Math.min(1, maxDrawable / r);
      // Para evitar círculos gigantes quando r muito pequeno, podemos usar fator mínimo
      const drawR = Math.max(6, r * scale);

      // Fundo sutil
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(0,0,cw,ch);

      // Círculo
      ctx.beginPath();
      ctx.arc(cx, cy, drawR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(79,70,229,0.15)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(79,70,229,0.9)';
      ctx.stroke();

      // Raio (linha)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + drawR, cy);
      ctx.strokeStyle = 'rgba(16,185,129,0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Marca o ponto final do raio
      ctx.beginPath();
      ctx.arc(cx + drawR, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16,185,129,1)';
      ctx.fill();

      // Texto do raio
      ctx.fillStyle = 'rgba(230,238,248,0.95)';
      ctx.font = '14px sans-serif';
      ctx.fillText(`r = ${radius}`, cx + drawR + 8, cy + 5);

      ctx.restore();
    }
  };

  window.Visualizacoes = visual;
})();
