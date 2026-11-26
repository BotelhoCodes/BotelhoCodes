// Gera as imagens do README a partir de tools/readme/pecas.html (Edge headless, 2x).
// Uso: node tools/gerar-readme.mjs [--marca=<pasta MARCA>] [--edge=<msedge.exe>]
// O pacote da marca fica fora deste repositório (GitHub/Matheus/MARCA); só as imagens prontas vêm para cá.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => (process.argv.find((a) => a.startsWith(`--${n}=`)) || '').split('=').slice(1).join('=') || d;
const MARCA = path.resolve(arg('marca', path.join(RAIZ, '..', '..', 'Matheus', 'MARCA')));
const EDGE = arg('edge', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe');

const PECAS = [
  ['hero', 1080, 460],
  ['pilares', 1080, 400],
  ['stack', 1080, 612],
  ['fim', 1080, 150],
  ['c-linkedin', 532, 128],
  ['c-instagram', 532, 128],
  ['c-whatsapp', 1080, 128],
];

if (!fs.existsSync(path.join(MARCA, '01-logo'))) throw new Error('Pacote da marca não encontrado em ' + MARCA + ' (use --marca=...)');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'botelhocodes-'));
const html = path.join(tmp, 'pecas.html');
const marcaUrl = pathToFileURL(MARCA).href;
fs.writeFileSync(html, fs.readFileSync(path.join(RAIZ, 'tools', 'readme', 'pecas.html'), 'utf8').replaceAll('{{MARCA}}', marcaUrl));

for (const [nome, w, h] of PECAS) {
  const saida = path.join(RAIZ, 'assets', `readme-${nome}.png`);
  const r = spawnSync(EDGE, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    `--user-data-dir=${path.join(tmp, 'perfil')}`,
    '--force-device-scale-factor=2', '--default-background-color=00000000',
    '--allow-file-access-from-files', '--virtual-time-budget=5000',
    `--window-size=${w},${h}`, `--screenshot=${saida}`,
    pathToFileURL(html).href + '?p=' + nome,
  ], { encoding: 'utf8' });
  if (!fs.existsSync(saida)) throw new Error(`falhou: ${nome}\n${r.stderr}`);
  console.log(`✔ assets/readme-${nome}.png`);
}
fs.rmSync(tmp, { recursive: true, force: true });
