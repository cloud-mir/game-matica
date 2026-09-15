// src/modules/Visualizacoes.js
// Sistema de renderização em canvas com suporte a múltiplos tipos

export class Visualizacoes {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.warn(`Canvas com id "${canvasId}" não encontrado`);
      return;
    }
    this.ctx = this.canvas.getContext('2d');
    this.zoom = 1;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  /**
   * Define nível de zoom
   * @param {number} factor - Fator de zoom (1 = 100%)
   */
  setZoom(factor) {
    this.zoom = Number(factor) || 1;
  }

  /**
   * Redimensiona canvas para DPI do dispositivo
   */
  resize() {
    if (!this.canvas || !this.ctx) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor((rect.height || 300) * dpr));

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.clear();
  }

  /**
   * Limpa o canvas
   */
  clear() {
    if (!this.ctx) return;
    const cw = this.canvas.width / (window.devicePixelRatio || 1);
    const ch = this.canvas.height / (window.devicePixelRatio || 1);
    this.ctx.clearRect(0, 0, cw, ch);
  }

  /**
   * Desenha um círculo proporcional ao raio
   * @param {number} radiusUnits - Raio em unidades
   */
  drawCircle(radiusUnits) {
    if (!this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;
    const cw = this.canvas.width / dpr;
    const ch = this.canvas.height / dpr;

    ctx.save();
    ctx.clearRect(0, 0, cw, ch);

    const cx = cw / 2;
    const cy = ch / 2;

    const padding = 20;
    const maxDrawable = Math.min(cx, cy) - padding;
    const rUnits = Math.max(0, Number(radiusUnits));

    let ppu = 1;
    if (rUnits === 0) {
      ppu = 1 * this.zoom;
    } else {
      ppu = (maxDrawable / rUnits) * this.zoom;
    }

    const maxPpu = 500;
    ppu = Math.max(0.01, Math.min(maxPpu, ppu));

    const finalR = Math.max(6, rUnits * ppu);

    // Fundo
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(0, 0, cw, ch);

    // Círculo preenchido
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

    // Ponto final do raio
    ctx.beginPath();
    ctx.arc(cx + finalR, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16,185,129,1)';
    ctx.fill();

    // Texto
    ctx.fillStyle = 'rgba(230,238,248,0.95)';
    ctx.font = '14px sans-serif';
    ctx.fillText(`r = ${radiusUnits}`, cx + finalR + 8, cy + 5);

    ctx.restore();
  }

  /**
   * Desenha um gráfico de barras simples
   * @param {Array} data - Array de números
   * @param {Array} labels - Labels das barras
   */
  drawBarChart(data, labels = []) {
    if (!this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;
    const cw = this.canvas.width / dpr;
    const ch = this.canvas.height / dpr;

    ctx.save();
    ctx.clearRect(0, 0, cw, ch);

    if (!data || data.length === 0) {
      ctx.restore();
      return;
    }

    const max = Math.max(...data);
    const padding = 40;
    const barWidth = (cw - padding * 2) / data.length;
    const scale = (ch - padding * 2) / max;

    // Desenhar barras
    data.forEach((value, index) => {
      const x = padding + index * barWidth + barWidth * 0.1;
      const height = value * scale;
      const y = ch - padding - height;

      ctx.fillStyle = `hsl(${index * 30}, 70%, 50%)`;
      ctx.fillRect(x, y, barWidth * 0.8, height);

      // Label
      if (labels[index]) {
        ctx.fillStyle = 'rgba(230,238,248,0.8)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x + barWidth * 0.4, ch - padding + 20);
      }
    });

    ctx.restore();
  }
}

// Exportar instância singleton
export let visualizacoes = null;

export function initVisualizations(canvasId) {
  visualizacoes = new Visualizacoes(canvasId);
  return visualizacoes;
}
