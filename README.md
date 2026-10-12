# DashStack — Admin Dashboard (React + Vite + Tailwind)

A pixel-faithful build of the DashStack Figma design: 20 screens, full dark/light
theming through the React Context API, and responsive layouts from 320px up.

## Run it

```bash
npm install
npm run dev
```

`npm run dev` starts **both** the Vite app and the json-server API
(http://localhost:3001). Open the URL Vite prints (usually http://localhost:5173).

Other scripts: `npm run dev:web` (app only), `npm run api` (API only),
`npm run seed` (reset `db.json` to the sample data — stop the API first).

Build for production with `npm run build` and preview it with `npm run preview`.

No extra install steps are needed — `react-router-dom`, `recharts` and
`lucide-react` are already listed in `package.json`.

## Routes

| Path | Screen |
| --- | --- |
| `/` | Dashboard |
| `/products` | Products |
| `/favorites` | Favorites |
| `/inbox` | Inbox (list + thread view) |
| `/orders` | Order Lists (date / type / status filters) |
| `/product-stock` | Product Stock |
| `/pricing` | Pricing |
| `/calendar`, `/calendar/new-event` | Calender, Add New Event |
| `/todo` | To-Do List / Add New To-Do |
| `/contact`, `/contact/new` | Contact, Add New Contact |
| `/invoice` | Invoice |
| `/ui-elements` | UI Elements (bar / pie / donut charts) |
| `/team`, `/team/new` | Team, Add Team Member |
| `/table` | Table |
| `/settings` | General Settings |
| `/login`, `/signup` | Login, Create an Account |
| anything else | 404 |

## Troubleshooting

`EADDRINUSE ... 3001` means an old API (or another app) is still using the port.
Stop the old `npm run dev` with Ctrl+C, or free the port:
`lsof -ti :3001 | xargs kill` (and `lsof -ti :5173 | xargs kill` for Vite).

## Dynamic data (json-server)

Products, favourites, team members, calendar events and mail are stored in
`db.json` and served by [json-server](https://github.com/typicode/json-server).
The app calls `/api/...`, which Vite proxies to `http://127.0.0.1:3001`
(see `vite.config.js`), so changes survive a refresh and are visible in the file.

| Collection | Used by | Notes |
| --- | --- | --- |
| `products` | Products, Favorites | 28 items; `favorite: true` puts a product in Favorites |
| `team` | Team, Add Team Member | photo upload is stored as a small data URL |
| `events` | Calendar, Add New Event | `date` / `endDate` are `YYYY-MM-DD` |
| `mails`, `messages` | Inbox | `folder` is inbox / sent / draft / spam / bin |

To use a hosted API instead, set `VITE_API_URL` (for example
`VITE_API_URL=https://my-api.example.com npm run build`).
Dashboard charts, orders, stock, pricing, to-do and contacts are still static
sample data in `src/data/mockData.js`.

## Theme

`src/context/ThemeContext.jsx` holds the only copy of the theme. It reads
`localStorage` (falling back to the OS preference) on first render, toggles the
`dark` class on `<html>`, and writes every change back to storage, so the choice
survives a refresh. Components read it with the `useTheme()` hook; Tailwind's
`dark:` variants do the rest.

## Images

Images for products, team and events live in `public/img/` and are referenced
from `db.json` as `/img/...`. Do not name a folder in `public/` after a
collection (`products`, `team`, `events`...) — json-server serves `public/` and
the folder would shadow the API route. Products without a photo show a neutral
placeholder; use "Edit Product" to upload one.
