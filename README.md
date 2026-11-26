# Forja Treino

PWA mobile-first de treino e nutrição: fichas com Tri-set, cronômetro de sessão e descanso, biblioteca de exercícios com vídeo, plano nutricional por objetivo, histórico/gráficos e alerta de periodização de 6 meses.

Stack: React 18 + Vite 5, Tailwind CSS 3, Lucide, Recharts. Dados 100% no `localStorage` (prefixo `forja:`).

## Rodar

```bash
npm install
npm run dev          # http://localhost:5173 (use --host para abrir no celular na mesma rede)
npm run build        # PWA em dist/ (publique em qualquer hosting estático: Vercel, Netlify, GitHub Pages)
npm run build:single # um único HTML em dist-single/ (prévia/compartilhamento)
```

## Arquitetura de dados

| Chave | Formato |
|---|---|
| `profile` | `{ name, sex, weight, height, age, activity, goal, onboarded }` |
| `exercises` | `[{ id, name, group, instructions, videoUrl, custom }]` |
| `workouts` | `[{ id, name, focus, color, createdAt, renewedFrom?, blocks: Block[] }]` |
| Block | `{ id, type: 'single' \| 'triset', rest, sets?, items: [{ exerciseId, sets, reps, load }] }` |
| `sessions` | `[{ id, workoutId, workoutName, startedAt, endedAt, durationSec, volume, entries: [{ exerciseId, name, sets: [{ reps, load, done }] }] }]` |
| `activeSession` | sessão em andamento (sobrevive a recarregar) com `steps[]`, `idx` e `rest: { endsAt, total }` |
| `snoozes` | `{ [workoutId]: ISO }` adiamento do alerta de 6 meses |

- **Tri-set**: a sessão "achata" a ficha em passos. Num Tri-set, cada rodada gera 3 passos seguidos com descanso 0 e o descanso do bloco só no 3º.
- **Descanso**: guardado como timestamp de término (`endsAt`), então o timer continua certo mesmo com a tela bloqueada ou a página recarregada.
- **Volume** = Σ reps × kg das séries concluídas.
- **Periodização**: `hoje − createdAt ≥ 180 dias` ⇒ alerta. "Aplicar trocas" troca exercícios por outros do mesmo grupo e reinicia `createdAt`.
- **Nutrição**: Mifflin-St Jeor × fator de atividade, ajuste por objetivo, proteína/gordura em g/kg e carboidrato no restante.

## Estrutura

```
src/
  lib/        storage, store (contexto), seed (exercícios + exemplos), session, nutrition, periodization, audio, utils, images
  components/ ui, BottomNav, YouTubeEmbed, ProfileForm
  screens/    Workouts, WorkoutEditor, WorkoutSession, Library, Nutrition, Progress, Onboarding
  assets/bg/  fotos do Pexels (ver CREDITS.md)
```

Links de demonstração apontam para páginas do Gymkee (somente link, sem copiar o conteúdo).
