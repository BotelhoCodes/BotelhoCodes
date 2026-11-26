#!/usr/bin/env node
/* Gera os painéis do README na identidade Matheus Botelho (texto em contorno: aparece com
   Manrope e JetBrains Mono em qualquer navegador, sem depender de fonte instalada).
   Uso (na raiz do repositório):
     node tools/gerar-assets.mjs [--marca="<pasta MARCA>"] [--opentype="<opentype.min.js>"]
   Para mudar um texto, edite CONTEUDO abaixo e rode de novo. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GITHUB = path.resolve(RAIZ, '..', '..');
const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const MARCA = path.resolve(arg('marca', path.join(GITHUB, 'Matheus', 'MARCA')));
const OPENTYPE = path.resolve(arg('opentype', path.join(GITHUB, 'Matheus', 'SKILLS', 'marca-matheus-botelho', 'ferramentas', 'vendor', 'opentype.min.js')));
const opentype = createRequire(import.meta.url)(OPENTYPE);
const MANROPE = opentype.loadSync(path.join(MARCA, '05-tipografia', 'Manrope-Medium.ttf'));
const MONO = opentype.loadSync(path.join(MARCA, '05-tipografia', 'JetBrainsMono-Regular.ttf'));

const COR = { onix: '#16130F', onix2: '#1F1A15', patina: '#0F3B35', latao: '#C2903F', lataoClaro: '#D4A853', bronze: '#6B4E26', sinal: '#8DB5A5', papiro: '#E6DCC8', linha: '#3A3128' };
const W = 1080;

/* ---------------------------------------------------------------- conteúdo */
const CONTEUDO = {
  sobre: {
    rotulo: '01 / about',
    titulo: ['Applied AI for real businesses,', 'from reasoning to code.'],
    texto: [
      'Full-stack developer and data analyst in Vitória da Conquista, Brazil.',
      'I build AI agents, integrations and automations that give teams their',
      'time back, and I teach what I build in talks and workshops.',
    ],
  },
  faco: {
    rotulo: '02 / what i do',
    itens: [
      ['01', 'AI agents & automation', ['Agents, scripts and browser automation', 'that take recurring work off the team.']],
      ['02', 'APIs & integrations', ['Build and document APIs; connect ERP,', 'CRM and internal systems.']],
      ['03', 'Data & BI', ['Queries, dashboards and reports', 'that teams actually use.']],
      ['04', 'Full-stack web', ['Web apps from interface to backend,', 'deployed and maintained.']],
    ],
  },
  stack: {
    rotulo: '03 / stack',
    linhas: [
      ['ai & coding', ['Claude', 'Claude Code', 'OpenAI', 'Codex']],
      ['data & bi', ['Python', 'SQL', 'PostgreSQL', 'Power BI', 'Looker Studio', 'Grafana', 'Excel']],
      ['backend & apis', ['NestJS', 'Node.js', 'Supabase', 'Swagger', 'Insomnia']],
      ['frontend', ['Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS']],
      ['automation', ['Playwright', 'Selenium', 'ERP & CRM integrations']],
      ['infra', ['Docker', 'Vercel', 'GitHub Actions', 'VPS']],
      ['embedded', ['Arduino', 'ESP32']],
    ],
  },
  atividade: { rotulo: '04 / activity', titulo: 'Contributions' },
};

/* ---------------------------------------------------------------- utilidades */
const f = (n) => +n.toFixed(2);
const larg = (fonte, s, tam, track = 0) => fonte.getAdvanceWidth(s, tam) + track * tam * Math.max(0, [...s].length - 1);
/** texto em contorno; track = espaçamento extra em em (só para Mono) */
const txt = (fonte, s, x, y, tam, cor, { op = 1, track = 0, alinhar = 'esq' } = {}) => {
  const w = larg(fonte, s, tam, track);
  let cx = alinhar === 'dir' ? x - w : alinhar === 'centro' ? x - w / 2 : x;
  if (!track) return `<path fill="${cor}"${op < 1 ? ` fill-opacity="${op}"` : ''} d="${fonte.getPath(s, cx, y, tam).toPathData(2)}"/>`;
  let d = '';
  for (const ch of s) {
    d += fonte.getPath(ch, cx, y, tam).toPathData(2);
    cx += fonte.getAdvanceWidth(ch, tam) + track * tam;
  }
  return `<path fill="${cor}"${op < 1 ? ` fill-opacity="${op}"` : ''} d="${d}"/>`;
};
const rot = (s, x, y, cor = COR.latao, tam = 15) => txt(MONO, s, x, y, tam, cor, { track: 0.04 });
const painel = (h, corpo, titulo) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img" aria-labelledby="t">
  <title id="t">${titulo.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
  <rect x="1" y="1" width="${W - 2}" height="${h - 2}" rx="16" fill="${COR.onix}" stroke="${COR.papiro}" stroke-opacity=".10" stroke-width="1.5"/>
  ${corpo}
</svg>\n`;
/* régua curta do cabeçalho de cada painel: marcas de 10 em 10, longa a cada 5 */
const regua = (x, y, w) => {
  let s = '';
  for (let i = 0, px = x; px <= x + w; i++, px += 10) s += `<line x1="${px}" y1="${y}" x2="${px}" y2="${y - (i % 5 ? 5 : 10)}" stroke="${i % 5 ? COR.linha : COR.latao}" stroke-width="${i % 5 ? 1 : 1.5}"/>`;
  return s;
};
const cabecalho = (rotulo, titulo) => [
  rot(rotulo, 44, 58),
  titulo ? txt(MANROPE, titulo, 44, 104, 34, COR.papiro) : '',
].join('\n  ');
const gravar = (nome, conteudo) => {
  fs.writeFileSync(path.join(RAIZ, 'assets', nome), conteudo);
  console.log('✔ assets/' + nome);
};

/* ---------------------------------------------------------------- 01 · about */
{
  const c = CONTEUDO.sobre;
  const corpo = [
    cabecalho(c.rotulo),
    ...c.titulo.map((l, i) => txt(MANROPE, l, 44, 120 + i * 44, 38, i ? COR.lataoClaro : COR.papiro)),
    ...c.texto.map((l, i) => txt(MANROPE, l, 44, 234 + i * 30, 19, COR.papiro, { op: 0.78 })),
  ].join('\n  ');
  gravar('readme-01-about.svg', painel(340, corpo, `${c.titulo.join(' ')} ${c.texto.join(' ')}`));
}

/* ---------------------------------------------------------------- 02 · what i do */
{
  const c = CONTEUDO.faco;
  const cw = (W - 44 * 2 - 20) / 2, ch = 132, y0 = 92;
  const celulas = c.itens.map(([n, t, d], i) => {
    const x = 44 + (i % 2) * (cw + 20), y = y0 + Math.floor(i / 2) * (ch + 20);
    return [
      `<rect x="${x}" y="${y}" width="${f(cw)}" height="${ch}" rx="10" fill="${COR.onix2}"/>`,
      rot(n, x + 24, y + 38, COR.latao, 14),
      txt(MANROPE, t, x + 70, y + 40, 22, COR.papiro),
      ...d.map((l, j) => txt(MANROPE, l, x + 70, y + 74 + j * 26, 16.5, COR.papiro, { op: 0.72 })),
    ].join('');
  });
  const h = y0 + 2 * ch + 20 + 36;
  gravar('readme-02-what-i-do.svg', painel(h, [cabecalho(c.rotulo), ...celulas].join('\n  '), c.itens.map(([, t, d]) => `${t}: ${d.join(' ')}`).join(' · ')));
}

/* ---------------------------------------------------------------- 03 · stack */
{
  const c = CONTEUDO.stack;
  const x0 = 250, tam = 16, padX = 14, altChip = 34, gap = 10, passo = 50, y0 = 92;
  const linhas = c.linhas.map(([cat, itens], i) => {
    const y = y0 + i * passo;
    let x = x0;
    const chips = itens.map((s) => {
      const w = larg(MONO, s, tam) + padX * 2;
      const out = `<rect x="${f(x)}" y="${y}" width="${f(w)}" height="${altChip}" rx="6" fill="${COR.onix2}"/>` + txt(MONO, s, x + padX, y + 22.5, tam, COR.papiro, { op: 0.82 });
      x += w + gap;
      if (x > W - 44) console.warn(`  ! linha "${cat}" passou da largura (${Math.round(x)} px)`);
      return out;
    });
    return [rot(cat, 44, y + 22.5, COR.latao, 15), ...chips].join('');
  });
  const h = y0 + c.linhas.length * passo + 26;
  gravar('readme-03-stack.svg', painel(h, [cabecalho(c.rotulo), ...linhas].join('\n  '), c.linhas.map(([cat, it]) => `${cat}: ${it.join(', ')}`).join('. ')));
}

/* ---------------------------------------------------------------- 04 · activity (cabeçalho) */
{
  const c = CONTEUDO.atividade;
  gravar('readme-04-activity.svg', painel(130, cabecalho(c.rotulo, c.titulo), c.titulo));
}

/* ---------------------------------------------------------------- rodapé: assinatura */
{
  /* a moeda oficial, sem o próprio width/height (repetir atributo invalida o SVG) */
  const moeda = fs.readFileSync(path.join(MARCA, '01-logo', 'simbolo', 'moeda-latao.svg'), 'utf8')
    .replace(/<\?xml[^>]*>/, '').replace(/<title>.*?<\/title>/s, '')
    .replace(/<svg([^>]*)>/, (_, a) => `<svg x="44" y="22" width="56" height="56"${a.replace(/\s(width|height)="[^"]*"/g, '')}>`);
  const corpo = [
    moeda,
    txt(MANROPE, 'Matheus Botelho', 120, 52, 22, COR.papiro),
    rot('do lógos ao código', 120, 74, COR.latao, 14),
    txt(MONO, '35°52′N 23°18′E', W - 44, 58, 14, COR.latao, { track: 0.04, alinhar: 'dir' }),
  ];
  gravar('readme-05-assinatura.svg', painel(100, corpo.join('\n  '), 'Matheus Botelho · do lógos ao código'));
}

/* ---------------------------------------------------------------- tema leve: banner em pátina, cards com borda discreta
   latão só como acento (proporção da marca: 70 fundo · 20 texto · 8 latão · 2 sinal). Pode rodar de novo. */
{
  const ed = (arq, trocas) => {
    const p = path.join(RAIZ, 'assets', arq);
    let s = fs.readFileSync(p, 'utf8');
    for (const [de, para] of trocas) s = s.split(de).join(para);
    fs.writeFileSync(p, s);
    console.log('✔ assets/' + arq + ' (tema leve)');
  };
  ed('github-banner-onix.svg', [
    ['<rect width="1080" height="320" rx="16" fill="#16130F"/>', `<rect width="1080" height="320" rx="16" fill="${COR.patina}"/>`],
    ['stroke="#C2903F" stroke-opacity=".42"', `stroke="${COR.papiro}" stroke-opacity=".10"`],
    ['stroke="#3A3128"', 'stroke="#24564E"'],
    ['stroke="#2C251E"', 'stroke="#1B4A43"'],
    ['fill="url(#grega)" opacity=".82"', 'fill="url(#grega)" opacity=".45"'],
  ]);
  for (const c of ['linkedin', 'instagram', 'github', 'whatsapp']) {
    ed(`github-card-${c}-latao.svg`, [
      ['fill="#0F3B35" stroke="#C2903F" stroke-width="2"', `fill="${COR.onix}" stroke="${COR.papiro}" stroke-opacity=".12" stroke-width="1.5"`],
      ['fill="#16130F" stroke="#C2903F" stroke-width="2"', `fill="${COR.onix}" stroke="${COR.papiro}" stroke-opacity=".12" stroke-width="1.5"`],
      ['stroke="#C2903F" stroke-opacity=".55"', `stroke="${COR.latao}" stroke-opacity=".3"`],
    ]);
  }
}

/* ---------------------------------------------------------------- rótulo do banner (μβ / botelhocodes) */
for (const [arq, cor] of [['github-banner-onix.svg', COR.latao], ['github-banner-polido.svg', COR.bronze]]) {
  const p = path.join(RAIZ, 'assets', arq);
  let s = fs.readFileSync(p, 'utf8');
  const ini = s.search(/<g[^>]*transform="translate\(0 \d+\)"><!-- (Σ no_palco|Δ radar|μβ) \/ (github|botelhocodes) -->/);
  if (ini < 0) { console.warn(`  ! ${arq}: rótulo não encontrado (já trocado?)`); continue; }
  const fim = s.indexOf('</g>', ini) + 4;
  const y = Number(s.slice(ini, fim).match(/translate\(0 (\d+)\)/)[1]);
  const novo = `<g transform="translate(0 ${y})"><!-- μβ / botelhocodes -->${txt(MONO, 'μβ / botelhocodes', 44, 0, 24.53, cor)}</g>`;
  s = s.slice(0, ini) + novo + s.slice(fim);
  fs.writeFileSync(p, s);
  console.log('✔ assets/' + arq + ' (rótulo μβ / botelhocodes)');
}
