# Predatori vs Guardiani - Master Tool

Un assistente digitale per il gioco di carte fisico "Predatori vs Guardiani". Questa applicazione permette al Master di gestire il flusso di gioco, i ruoli e lo stato dei giocatori in una partita multiplayer locale o remota.

## Funzionalità

- **Multiplayer Realtime**: I giocatori si uniscono scansionando un QR code o cliccando un link.
- **Gestione Ruoli**: Assegnazione casuale automatica (Predatore/Guardiano).
- **Flusso Guidato**: Script fase Alba, gestione Giorno/Notte, votazioni.
- **Serverless**: Backend gestito tramite Supabase (Database + Realtime).

## Configurazione Iniziale (Supabase)

L'app richiede un progetto Supabase per funzionare.

1. Crea un nuovo progetto su [Supabase](https://supabase.com).
2. Vai nell'app, clicca l'icona **Impostazioni** (ingranaggio).
3. Copia lo script SQL mostrato e eseguilo nell'**SQL Editor** di Supabase per creare le tabelle.
4. Nelle impostazioni del progetto Supabase (API), copia:
   - **Project URL**
   - **Anon / Public Key**
5. Inseriscili nell'app per collegarla.

## Installazione Locale

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

## Build & Deploy

Per creare la versione di produzione:

```bash
npm run build
```

La cartella `dist` conterrà i file statici pronti per essere caricati su GitHub Pages, Netlify o Vercel.

## Stack Tecnologico

- **Frontend**: React, TypeScript, TailwindCSS (via CDN per semplicità V1).
- **Build Tool**: Vite.
- **Backend**: Supabase (PostgreSQL + Realtime).
