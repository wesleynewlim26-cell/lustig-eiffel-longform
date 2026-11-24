import { Composition, CalculateMetadataFunction, useCurrentFrame, useVideoConfig, HtmlInCanvas } from "remotion";

type Props = {};

const calculateMetadata: CalculateMetadataFunction<Props> = () => {
  return {
    durationInFrames: 3600,
    fps: 30,
    width: 720,
    height: 1280,
  };
};

const TAU = Math.PI * 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const mulberry32 = (a: number) => {
  return () => {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const FPS = 30;
const rng = mulberry32(12345);

const COLORS = {
  bg: "#0a0a1a",
  paper: "#1a1a2e",
  paperLight: "#252540",
  outline: "#000000",
  text: "#f0e6d2",
  textDim: "#a09880",
  gold: "#ffd700",
  goldDim: "#ccac00",
  amber: "#ffb700",
  warmLight: "#ffaa44",
  coolLight: "#44aaff",
  red: "#cc3333",
  green: "#33cc77",
  white: "#ffffff",
};

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCharacter(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, opts: {
  headTilt?: number;
  blink?: boolean;
  mouth?: "neutral" | "smile" | "smirk" | "surprised" | "concerned" | "speakA" | "speakI" | "speakU" | "speakE" | "speakO";
  hat?: boolean;
  suitColor?: string;
} = {}) {
  const { headTilt = 0, blink = false, mouth = "neutral", hat = false, suitColor = "#1a1a2e" } = opts;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  ctx.fillStyle = suitColor;
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-30, 10);
  ctx.lineTo(-30, 80);
  ctx.quadraticCurveTo(-30, 95, -15, 95);
  ctx.lineTo(15, 95);
  ctx.quadraticCurveTo(30, 95, 30, 80);
  ctx.lineTo(30, 10);
  ctx.quadraticCurveTo(30, -5, 15, -5);
  ctx.lineTo(-15, -5);
  ctx.quadraticCurveTo(-30, -5, -30, 10);
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = "#0a0a1a";
  ctx.beginPath();
  ctx.moveTo(-5, -5);
  ctx.lineTo(-20, 30);
  ctx.lineTo(-5, 30);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(5, -5);
  ctx.lineTo(20, 30);
  ctx.lineTo(5, 30);
  ctx.fill();
  
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.lineTo(-8, 35);
  ctx.lineTo(8, 35);
  ctx.fill();
  ctx.stroke();
  
  const headY = -50;
  ctx.save();
  ctx.translate(0, headY);
  ctx.rotate(headTilt);
  
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(8, 8, 42, 38, 0, 0, TAU);
  ctx.fill();
  
  ctx.fillStyle = "#e8d5b7";
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 36, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  
  if (hat) {
    ctx.fillStyle = "#0a0a1a";
    ctx.beginPath();
    ctx.moveTo(-50, -20);
    ctx.lineTo(50, -20);
    ctx.lineTo(40, -45);
    ctx.lineTo(-40, -45);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -20, 55, 8, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
  
  if (!blink) {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(-14, -4, 6, 8, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(14, -4, 6, 8, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-16, -6, 2, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12, -6, 2, 0, TAU);
    ctx.fill();
  } else {
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-20, -4);
    ctx.lineTo(-8, -4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -4);
    ctx.lineTo(20, -4);
    ctx.stroke();
  }
  
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-22, -16);
  ctx.lineTo(-6, -18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, -18);
  ctx.lineTo(22, -16);
  ctx.stroke();
  
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  if (mouth === "smile") {
    ctx.beginPath();
    ctx.moveTo(-12, 14);
    ctx.quadraticCurveTo(0, 22, 12, 14);
    ctx.stroke();
  } else if (mouth === "smirk") {
    ctx.beginPath();
    ctx.moveTo(-10, 16);
    ctx.quadraticCurveTo(5, 12, 12, 16);
    ctx.stroke();
  } else if (mouth === "surprised") {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(0, 18, 6, 0, TAU);
    ctx.fill();
  } else if (mouth === "concerned") {
    ctx.beginPath();
    ctx.moveTo(-10, 18);
    ctx.quadraticCurveTo(0, 14, 10, 18);
    ctx.stroke();
  } else if (mouth === "speakA") {
    ctx.beginPath();
    ctx.ellipse(0, 16, 8, 10, 0, 0, TAU);
    ctx.stroke();
  } else if (mouth === "speakI") {
    ctx.beginPath();
    ctx.moveTo(-6, 10);
    ctx.lineTo(-6, 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(6, 10);
    ctx.lineTo(6, 22);
    ctx.stroke();
  } else if (mouth === "speakU") {
    ctx.beginPath();
    ctx.arc(0, 16, 5, 0, TAU);
    ctx.stroke();
  } else if (mouth === "speakE") {
    ctx.beginPath();
    ctx.moveTo(-8, 16);
    ctx.quadraticCurveTo(0, 12, 8, 16);
    ctx.stroke();
  } else if (mouth === "speakO") {
    ctx.beginPath();
    ctx.arc(0, 16, 6, 0, TAU);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-8, 16);
    ctx.lineTo(8, 16);
    ctx.stroke();
  }
  
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.moveTo(0, -36);
  ctx.quadraticCurveTo(20, -10, 20, 36);
  ctx.quadraticCurveTo(0, 20, -20, 36);
  ctx.quadraticCurveTo(-20, -10, 0, -36);
  ctx.fill();
  
  ctx.restore();
  ctx.restore();
}

function drawEiffelTower(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, glow: number = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.moveTo(-60, 0);
  ctx.lineTo(-15, -180);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(60, 0);
  ctx.lineTo(15, -180);
  ctx.stroke();
  
  for (let i = 0; i < 6; i++) {
    const py = -20 - i * 28;
    const w = 55 - i * 7;
    ctx.beginPath();
    ctx.moveTo(-w, py);
    ctx.lineTo(w, py);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-w, py);
    ctx.lineTo(0, py - 14);
    ctx.lineTo(w, py);
    ctx.stroke();
  }
  
  ctx.fillStyle = "#2a2a3a";
  ctx.beginPath();
  ctx.moveTo(-20, -200);
  ctx.lineTo(20, -200);
  ctx.lineTo(15, -210);
  ctx.lineTo(-15, -210);
  ctx.fill();
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(0, -210);
  ctx.lineTo(0, -250);
  ctx.stroke();
  
  if (glow > 0) {
    ctx.fillStyle = `rgba(255, 187, 0, ${glow * 0.6})`;
    for (let i = 0; i < 5; i++) {
      const py = -40 - i * 30;
      const w = 50 - i * 6;
      ctx.fillRect(-w, py - 5, w * 2, 8);
    }
    ctx.fillRect(-15, -205, 30, 10);
  }
  
  ctx.restore();
}

function drawNewspaper(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, progress: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  const openProg = clamp(progress * 2, 0, 1);
  const w = 200 * openProg;
  
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(4, 4, w, 250);
  
  ctx.fillStyle = "#f5f0e1";
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 2;
  ctx.fillRect(0, 0, w, 250);
  ctx.strokeRect(0, 0, w, 250);
  
  if (openProg > 0.3) {
    ctx.fillStyle = "#000000";
    ctx.font = "bold 22px serif";
    ctx.textAlign = "center";
    ctx.fillText("MENARA EIFFEL", w/2, 60);
    ctx.fillText("DIJUAL", w/2, 90);
    ctx.font = "16px serif";
    ctx.fillText("Biaya Perbaikan: 250 Juta Franc", w/2, 125);
    
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(15, 150 + i * 20);
      ctx.lineTo(w - 15, 150 + i * 20);
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

function drawHotelScene(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, dealers: number, highlightDealer: number = -1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  const grad = ctx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, "#0a0a1a");
  grad.addColorStop(1, "#1a1a2e");
  ctx.fillStyle = grad;
  ctx.fillRect(-300, -100, 600, 300);
  
  const chandGrad = ctx.createRadialGradient(0, -80, 0, 0, -80, 150);
  chandGrad.addColorStop(0, "rgba(255,220,150,0.3)");
  chandGrad.addColorStop(1, "rgba(255,187,0,0)");
  ctx.fillStyle = chandGrad;
  ctx.beginPath();
  ctx.arc(0, -80, 150, 0, TAU);
  ctx.fill();
  
  ctx.fillStyle = "#1a1a2e";
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  ctx.fillRect(-200, 40, 400, 60);
  ctx.strokeRect(-200, 40, 400, 60);
  
  ctx.fillStyle = "#f5f0e1";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.fillRect(-50, 50, 100, 40);
  ctx.strokeRect(-50, 50, 100, 40);
  ctx.fillStyle = "#000";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("RAHASIA", 0, 74);
  ctx.fillText("PENJUALAN", 0, 90);
  ctx.fillText("EIFFEL", 0, 106);
  
  for (let i = 0; i < dealers; i++) {
    const dx = -150 + i * 60;
    const isHighlight = i === highlightDealer;
    drawCharacter(ctx, dx, 20, 0.4, {
      suitColor: isHighlight ? "#2a2a4a" : "#1a1a2e",
      mouth: isHighlight ? "concerned" : "neutral",
      blink: false,
    });
  }
  
  drawCharacter(ctx, 0, 10, 0.5, {
    hat: true,
    suitColor: "#0a0a1a",
    mouth: "smirk",
    headTilt: -0.05,
  });
  
  ctx.restore();
}

function drawBriefcase(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, open: number, moneyFloat: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  ctx.fillStyle = "#1a1a2e";
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 3;
  ctx.fillRect(-60, -40, 120, 80);
  ctx.strokeRect(-60, -40, 120, 80);
  
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-20, -40);
  ctx.quadraticCurveTo(0, -60, 20, -40);
  ctx.stroke();
  
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(-5, -45, 10, 10);
  
  if (open > 0) {
    ctx.save();
    ctx.translate(0, -40);
    ctx.rotate(-open * 1.2);
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(-60, -40, 120, 20);
    ctx.strokeRect(-60, -40, 120, 20);
    ctx.restore();
    
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * TAU + moneyFloat * 2;
      const radius = 60 + Math.sin(moneyFloat * 3 + i) * 25;
      const mx = Math.cos(angle) * radius;
      const my = Math.sin(angle) * radius * 0.5 - 20;
      
      ctx.fillStyle = "#33cc77";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.fillRect(mx - 12, my - 6, 24, 12);
      ctx.strokeRect(mx - 12, my - 6, 24, 12);
      ctx.fillStyle = "#000";
      ctx.font = "8px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("100", mx, my + 3);
    }
  }
  
  ctx.restore();
}

function drawPoliceStation(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, poissonLeaves: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  ctx.fillStyle = "#1a1a2e";
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 2;
  ctx.fillRect(-180, -200, 360, 300);
  ctx.strokeRect(-180, -200, 360, 300);
  
  ctx.fillStyle = "#0a0a1a";
  ctx.fillRect(-100, -220, 200, 50);
  ctx.strokeRect(-100, -220, 200, 50);
  ctx.fillStyle = COLORS.white;
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("POLISI", 0, -185);
  
  const px = lerp(0, 250, poissonLeaves);
  drawCharacter(ctx, px, -20, 0.5, {
    suitColor: "#2a2a3e",
    mouth: "concerned",
    headTilt: poissonLeaves > 0.5 ? 0.1 : 0,
  });
  
  if (poissonLeaves < 0.7) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + 80, -100);
    ctx.lineTo(px + 200, -100);
    ctx.lineTo(px + 200, -180);
    ctx.lineTo(px + 80, -180);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = "#000";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Malu...", px + 90, -145);
    ctx.fillText("Tidak lapor.", px + 90, -125);
  }
  
  ctx.restore();
}

function drawShip(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, progress: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  const waveGrad = ctx.createLinearGradient(0, 0, 0, 100);
  waveGrad.addColorStop(0, "#0a1a2e");
  waveGrad.addColorStop(1, "#050a15");
  ctx.fillStyle = waveGrad;
  ctx.fillRect(-400, -50, 800, 200);
  
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    for (let x = -400; x < 400; x += 10) {
      const wy = Math.sin(x * 0.02 + progress * 5 + i) * 10 + i * 25;
      if (x === -400) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }
  
  const shipX = lerp(-300, 300, progress);
  ctx.translate(shipX, 30);
  
  ctx.fillStyle = "#0a0a1a";
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-150, 0);
  ctx.lineTo(-180, 50);
  ctx.lineTo(180, 50);
  ctx.lineTo(150, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(-120, -40, 240, 40);
  ctx.strokeRect(-120, -40, 240, 40);
  
  ctx.fillRect(-50, -90, 100, 50);
  ctx.strokeRect(-50, -90, 100, 50);
  
  ctx.fillStyle = "rgba(255,187,0,0.4)";
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(-45 + i * 25, -85, 15, 20);
    ctx.strokeRect(-45 + i * 25, -85, 15, 20);
  }
  
  ctx.fillStyle = "#0a0a1a";
  ctx.fillRect(-15, -140, 30, 50);
  ctx.strokeRect(-15, -140, 30, 50);
  
  for (let i = 0; i < 4; i++) {
    const sy = -160 - i * 18 - progress * 30;
    ctx.fillStyle = `rgba(150,150,150,${0.3 - i * 0.07})`;
    ctx.beginPath();
    ctx.arc(0 + Math.sin(progress * 8 + i) * 10, sy, 12 + i * 3, 0, TAU);
    ctx.fill();
  }
  
  drawBriefcase(ctx, -40, -50, 0.5, 0, 0);
  drawBriefcase(ctx, 40, -50, 0.5, 0, 0);
  
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const wx = 150 + i * 20;
    const wy = 30 + Math.sin(progress * 10 + i) * 8;
    ctx.beginPath();
    ctx.moveTo(wx, wy - 15);
    ctx.quadraticCurveTo(wx + 10, wy, wx + 20, wy - 15);
    ctx.stroke();
  }
  
  ctx.restore();
}

function drawEiffelNight(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, glowPulse: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  const skyGrad = ctx.createLinearGradient(0, -350, 0, 100);
  skyGrad.addColorStop(0, "#050515");
  skyGrad.addColorStop(0.5, "#0a0a2a");
  skyGrad.addColorStop(1, "#1a1a2e");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(-300, -350, 600, 450);
  
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 80; i++) {
    const sx = (rng() - 0.5) * 600;
    const sy = (rng() - 0.5) * 350 - 175;
    const sr = rng() * 2 + 0.5;
    const alpha = 0.3 + 0.7 * Math.sin(glowPulse * 3 + i);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  
  drawEiffelTower(ctx, 0, 50, 1.5, 0.5 + 0.5 * Math.sin(glowPulse * 2));
  
  ctx.fillStyle = "#0a0a1a";
  ctx.fillRect(-300, 120, 600, 60);
  
  ctx.fillStyle = COLORS.text;
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("MENARA EIFFEL MASIH BERDIRI", 0, 160);
  ctx.font = "16px sans-serif";
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText("Belum pernah dijual... secara resmi", 0, 190);
  
  ctx.restore();
}

function drawLabel(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, bgColor: string = "#0a0a1a", textColor: string = "#ffd700", padding: number = 12) {
  ctx.font = "bold 20px sans-serif";
  const metrics = ctx.measureText(text);
  const w = metrics.width + padding * 2;
  const h = 36;
  
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, x - w/2, y - h/2, w, h, 8);
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function drawCaption(ctx: CanvasRenderingContext2D, w: number, h: number, text: string, progress: number, yPos: number = 0.88) {
  if (!text) return;
  
  const alpha = clamp(progress * 3, 0, 1) * clamp((1 - progress) * 3, 0, 1) * 1;
  if (alpha <= 0) return;
  
  ctx.save();
  ctx.globalAlpha = alpha;
  
  const lines = text.split("\n");
  const lineHeight = 44;
  const totalHeight = lines.length * lineHeight;
  const startY = h * yPos - totalHeight / 2;
  
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";
  
  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lineHeight;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 8;
    ctx.lineJoin = "round";
    ctx.strokeText(lines[i], w / 2, y);
    ctx.fillStyle = COLORS.gold;
    ctx.fillText(lines[i], w / 2, y);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText(lines[i], w / 2, y - 2);
  }
  
  ctx.restore();
}

// Scene draw functions - vertical 9:16 layout (720x1280)
function drawScene1(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  drawNewspaper(ctx, w/2, h/2 - 100, 1.2, clamp(p, 0, 1));
  drawCharacter(ctx, w/2, h/2 + 280, 0.7 * easeOutBack(clamp(p, 0, 1)), {
    hat: true,
    suitColor: "#0a0a1a",
    mouth: "smirk",
    blink: Math.floor(p * FPS * 180) % 60 < 3,
    headTilt: Math.sin(p * 2) * 0.05,
  });
  drawCaption(ctx, w, h, "1925: MENARA EIFFEL DIJUAL\nDUA KALI", clamp(p * 10, 0, 1), 0.85);
}

function drawScene2(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp(p, 0, 1);
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, "#0a1a2e");
  skyGrad.addColorStop(1, "#050a15");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);
  
  drawEiffelTower(ctx, w/2, h - 50, 1.5, charProg * 0.3);
  drawLabel(ctx, w/2, 80, "PARIS 1925", "#0a0a1a", "#ffd700");
  drawLabel(ctx, w/2, 140, "7.300 TON BESI BERKARAT", "#0a0a1a", "#ffaa44");
  drawCaption(ctx, w, h, "MENARA HARUS DIBONGKAR 1909\nPERANG SELAMATKAN NYA", clamp(p * 8, 0, 1), 0.85);
}

function drawScene3(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp(p, 0, 1);
  drawHotelScene(ctx, w/2, h/2 + 50, charProg, 6);
  drawLabel(ctx, w/2, 80, "HOTEL CRILLON • 6 DEALER", "#0a0a1a", "#ffd700");
  drawCaption(ctx, w, h, "VICTOR LUSTIG UNDANG DEALER BESI\nWHISKY TERSEMBUNYI DI LACI", clamp(p * 8, 0, 1), 0.85);
}

function drawScene4(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp(p, 0, 1);
  drawHotelScene(ctx, w/2, h/2 + 50, 1, 6, 2);
  
  ctx.save();
  ctx.translate(w/2, h/2 - 50);
  ctx.scale(1 + 0.5 * easeOut(charProg), 1 + 0.5 * easeOut(charProg));
  ctx.translate(-w/2, -h/2);
  drawHotelScene(ctx, w/2, h/2 + 50, 1, 6, 2);
  ctx.restore();
  
  drawLabel(ctx, w/2, 80, "7.000 TON • RAHASIA", "#0a0a1a", "#cc3333");
  drawCaption(ctx, w, h, "HARGA: 250.000 FRANC\nKONTRAK MINGGU DEPAN", clamp(p * 8, 0, 1), 0.85);
}

function drawScene5(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp(p, 0, 1);
  drawHotelScene(ctx, w/2, h/2 + 50, 1, 6, 2);
  drawCharacter(ctx, w/2 - 80, h/2 - 40, 0.5, {
    suitColor: "#2a2a3e",
    mouth: "concerned",
    blink: Math.floor(p * FPS * 180) % 40 < 2,
    headTilt: 0.1,
  });
  drawCharacter(ctx, w/2 + 20, h/2 - 30, 0.45, {
    hat: true,
    suitColor: "#0a0a1a",
    mouth: "smirk",
    headTilt: -0.1,
  });
  drawLabel(ctx, w/2, 80, "POISSON RAGU", "#0a0a1a", "#ffaa44");
  drawCaption(ctx, w, h, "LUSTIG BISIK: KORUPSI = BUKTI KEASLIAN", clamp(p * 8, 0, 1), 0.85);
}

function drawScene6(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp(p, 0, 1);
  const moneyFloat = p * 3;
  drawHotelScene(ctx, w/2, h/2 + 50, 1, 6, 2);
  drawBriefcase(ctx, w/2, h/2 + 200, 0.8, charProg, moneyFloat);
  drawLabel(ctx, w/2, 80, "SUAP 50.000 FRANC", "#0a0a1a", "#33cc77");
  drawCaption(ctx, w, h, "KONTRAK DITANDATANGANI MALAM ITU", clamp(p * 8, 0, 1), 0.85);
}

function drawScene7(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp(p, 0, 1);
  drawPoliceStation(ctx, w/2, h/2 + 80, 1, charProg);
  drawLabel(ctx, w/2, 80, "POISSON MALU • TIDAK LAPOR", "#0a0a1a", "#cc3333");
  drawCaption(ctx, w, h, "KORBAN KORUPSI TAK AKAN BICARA", clamp(p * 8, 0, 1), 0.85);
}

function drawScene8(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp(p, 0, 1);
  const speed = 1 + charProg;
  drawHotelScene(ctx, w/2, h/2 + 50, 1, 6);
  ctx.strokeStyle = "rgba(255,187,0,0.6)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const x = -200 + i * 40;
    const offset = (p * speed * 150 + i * 15) % 500 - 250;
    ctx.beginPath();
    ctx.moveTo(x + offset, h/2 - 80);
    ctx.lineTo(x + offset + 60, h/2 - 80);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, w/2 - 80, 50, 160, 50, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = COLORS.gold;
  ctx.font = "bold 24px monospace";
  ctx.textAlign = "center";
  ctx.fillText("2x LEBIH CEPAT", w/2, 86);
  drawLabel(ctx, w/2, 80, "RONDE 2 • UANG LAGI", "#0a0a1a", "#ffd700");
  drawCaption(ctx, w, h, "KALI INI DEALER JUJUR LAPOR POLISI", clamp(p * 8, 0, 1), 0.85);
}

function drawScene9(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp(p, 0, 1);
  ctx.fillStyle = "#0a0a1a";
  ctx.fillRect(0, 0, w, h);
  
  drawLabel(ctx, w/2, 120, "POLISI BURU", "#cc3333", "#ffffff");
  drawLabel(ctx, w/2, 180, "LUSTIG LARI KE NEW YORK", "#0a0a1a", "#ffd700");
  
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  ctx.setLineDash([15, 15]);
  ctx.beginPath();
  ctx.moveTo(w/2 - 200, h/2);
  ctx.lineTo(w/2 + 200, h/2);
  ctx.stroke();
  ctx.setLineDash([]);
  
  drawShip(ctx, w/2, h/2 + 120, 1, charProg);
  drawCaption(ctx, w, h, "TARGET BERIKUTNYA: AL CAPONE", clamp(p * 8, 0, 1), 0.85);
}

function drawScene10(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp(p, 0, 1);
  drawShip(ctx, w/2, h/2 + 80, 1, charProg);
  
  drawCharacter(ctx, w/2 - 180, h/2 - 100, 0.5, {
    suitColor: "#1a1a2e",
    mouth: "speakA",
    headTilt: 0.1,
  });
  drawCharacter(ctx, w/2 + 180, h/2 - 100, 0.5, {
    suitColor: "#2a2a2e",
    mouth: "surprised",
    headTilt: -0.1,
  });
  
  drawLabel(ctx, w/2 - 180, h/2 - 180, "LUSTIG", "#0a0a1a", "#ffd700");
  drawLabel(ctx, w/2 + 180, h/2 - 180, "CAPONE", "#0a0a1a", "#ffaa44");
  drawLabel(ctx, w/2, 80, "INVESTASI 50K DOLLAR", "#0a0a1a", "#ffd700");
  drawCaption(ctx, w, h, "CAPONE BERI 1K HADIAH KEJUJURAN", clamp(p * 8, 0, 1), 0.85);
}

function drawScene11(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const glowPulse = p * 0.5;
  drawEiffelNight(ctx, w/2, h/2, 1.2, glowPulse);
  
  drawCharacter(ctx, w/2 - 220, h/2 + 80, 0.5, {
    suitColor: "#0a0a1a",
    hat: true,
    mouth: "concerned",
    headTilt: 0.15,
  });
  drawCharacter(ctx, w/2 + 220, h/2 + 80, 0.5, {
    suitColor: "#1a1a2e",
    mouth: "neutral",
  });
  
  drawLabel(ctx, w/2 - 220, h/2 - 80, "LUSTIG", "#0a0a1a", "#ffd700");
  drawLabel(ctx, w/2 + 220, h/2 - 80, "FBI", "#0a0a1a", "#cc3333");
  drawLabel(ctx, w/2, 80, "DITANGKAP 1935", "#cc3333", "#ffffff");
  drawCaption(ctx, w, h, "ALCATRAZ 20 TAHUN • MENINGGAL 1947", clamp(p * 8, 0, 1), 0.85);
}

function drawScene12(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);
  
  drawEiffelTower(ctx, w/2, h/2 + 50, 2.0, 0.5 + 0.5 * Math.sin(p * 2));
  
  drawLabel(ctx, w/2, 100, "MASIH BERDIRI", "#0a0a1a", "#33cc77");
  drawLabel(ctx, w/2, 160, "BELUM PERNAH DIJUAL RESMI", "#0a0a1a", "#ffd700");
  drawCaption(ctx, w, h, "TERLALU BAGUS JADI NYATA? BOHONG.\nTERLALU RAHASIA? PASTIKAN SIAPA UNTUNG.", clamp(p * 8, 0, 1), 0.85);
}

function drawScene13(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);
  
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  drawRoundedRect(ctx, w/2 - 200, h/2 - 120, 400, 240, 20);
  ctx.fill();
  
  ctx.fillStyle = COLORS.gold;
  ctx.font = "bold 56px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("\u{1F4B0}", w/2, h/2 - 60);
  ctx.font = "bold 28px sans-serif";
  ctx.fillStyle = COLORS.text;
  ctx.fillText("FOLLOW @WEALTHSTOCK.ID", w/2, h/2 + 20);
  ctx.font = "20px sans-serif";
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText("EBOOK SURVIVAL FINANSIAL DI BIO", w/2, h/2 + 65);
  ctx.font = "18px sans-serif";
  ctx.fillText("CERITA UANG LAINNYA? SUBSCRIBE", w/2, h/2 + 100);
}

// Main draw function - routes to correct scene based on global progress
export function drawFrame(ctx: CanvasRenderingContext2D, w: number, h: number, progress: number, frame: number) {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);
  
  // Scene boundaries in frames (3600 total = 2 min @ 30fps)
  const scenes = [
    { end: 300, fn: drawScene1 },      // 0-300 (10s)
    { end: 600, fn: drawScene2 },      // 300-600 (10s)
    { end: 900, fn: drawScene3 },      // 600-900 (10s)
    { end: 1200, fn: drawScene4 },     // 900-1200 (10s)
    { end: 1500, fn: drawScene5 },     // 1200-1500 (10s)
    { end: 1800, fn: drawScene6 },     // 1500-1800 (10s)
    { end: 2100, fn: drawScene7 },     // 1800-2100 (10s)
    { end: 2400, fn: drawScene8 },     // 2100-2400 (10s)
    { end: 2700, fn: drawScene9 },     // 2400-2700 (10s)
    { end: 3000, fn: drawScene10 },    // 2700-3000 (10s)
    { end: 3200, fn: drawScene11 },    // 3000-3200 (6.7s)
    { end: 3400, fn: drawScene12 },    // 3200-3400 (6.7s)
    { end: 3600, fn: drawScene13 },    // 3400-3600 (6.7s)
  ];
  
  let frameStart = 0;
  for (const scene of scenes) {
    if (frame < scene.end) {
      const localProgress = (frame - frameStart) / (scene.end - frameStart);
      scene.fn(ctx, w, h, localProgress);
      break;
    }
    frameStart = scene.end;
  }
}

const MoneyStoryCanvas = ({ frame, progress }: { frame: number; progress: number }) => {
  return (
    <HtmlInCanvas
      width={720}
      height={1280}
      onPaint={(params: any) => {
        const canvas = params.canvas || params;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        drawFrame(ctx, 720, 1280, progress, frame);
      }}
    >
      <div />
    </HtmlInCanvas>
  );
};

export const MoneyStoryShorts = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;
  return <MoneyStoryCanvas frame={frame} progress={progress} />;
};

export const MyComposition = () => {
  return (
    <Composition
      id="MoneyStoryShorts"
      component={MoneyStoryShorts}
      durationInFrames={3600}
      fps={30}
      width={720}
      height={1280}
      calculateMetadata={calculateMetadata}
    />
  );
};

export const MyComponent = () => null;