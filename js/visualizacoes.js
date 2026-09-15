// visualizacoes.js — lógica de desenho e canvas
(function(){
  const visual = {
    canvas: null,
    ctx: null,
    zoom: 1,
    init(canvasId){
      this.canvas = document.getElementById(canvasId);
      if(!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', ()=> this.resize());
    },
    setZoom(factor){
      this.zoom = Number(factor) || 1;
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
      const cw = this.canvas.width / (window.devicePixelRatio || 1);
      const ch = this.canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0,0,cw,ch);
    },
    // Desenha um círculo proporcional ao raio informado (raio em unidades)
    drawCircle(radiusUnits){
      if(!this.ctx || !this.canvas) return;
      const ctx = this.ctx;
      const dpr = window.devicePixelRatio || 1;
      const cw = this.canvas.width / dpr;
      const ch = this.canvas.height / dpr;
      ctx.save();
      ctx.clearRect(0,0,cw,ch);

      const cx = cw / 2;
      const cy = ch / 2;

      // Define espaço disponível (em pixels)
      const padding = 20;
      const maxDrawable = Math.min(cx, cy) - padding;

      const rUnits = Math.max(0, Number(radiusUnits));

      // Calcular pixels-por-unidade (ppu) para caber o raio no canvas
      let ppu = 1; // pixels por unidade
      if(rUnits === 0){
        ppu = 1 * this.zoom; // default
      } else {
        ppu = (maxDrawable / rUnits) * this.zoom;
      }

      // limitar ppu para evitar círculos invisíveis
      const maxPpu = 500; // arbitrary cap
      ppu = Math.max(0.01, Math.min(maxPpu, ppu));

      const finalR = Math.max(6, rUnits * ppu); // at least 6px visible

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

      // Texto do raio (em unidades)
      ctx.fillStyle = 'rgba(230,238,248,0.95)';
      ctx.font = '14px sans-serif';
      ctx.fillText(`r = ${radiusUnits}`, cx + finalR + 8, cy + 5);

      ctx.restore();
    }
  };

  window.Visualizacoes = visual;
})();
