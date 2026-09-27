# Food Ordering App: React + Spring Boot

The frontend is React/Vite. The beginner-friendly backend is in `backend/` and uses
Spring Boot with a small in-memory restaurant list. No database is required for the
basic version.

## Run the app

1. Start the Spring Boot API from the `backend` folder:

	```bash
	mvn spring-boot:run
	```

	The API runs at `http://localhost:8080`.

2. In another terminal, start the React frontend from the project root:

	```bash
	npm install
	npm run dev
	```

	Open the URL printed by Vite, usually `http://localhost:5173`.

The frontend calls `GET /api/restaurants` and `GET /api/restaurants/{id}`. Vite
forwards those requests to Spring Boot during development. If the backend is off,
the frontend uses its local starter data so the screens still open.

## Beginner backend structure

- `Restaurant`: response data model
- `RestaurantService`: simple in-memory data and lookup logic
- `RestaurantController`: two REST endpoints
- `FoodOrderingApplication`: Spring Boot entry point

This intentionally does not add a database, JWT security, or a complicated service
layer. Those can be added later after the basic API is understood.

## Firebase setup

1. Create a Firebase project and register a Web app in the Firebase console.
2. Enable **Authentication > Sign-in method > Email/Password**.
3. Create a Firestore database.
4. Copy `.env.example` to `.env` and fill in the Web app configuration values.
5. Publish `firestore.rules` from the Firebase console or with the Firebase CLI.

The app uses Firebase Authentication for registration and login, stores user profiles in
`users/{uid}`, and stores orders in `orders`. Never commit `.env`; Vite exposes only the
`VITE_` variables to the browser, and Firestore rules enforce per-user access.

Restaurant pages read from the public `restaurants` Firestore collection. Until those
documents are imported, the app displays the starter data in `src/data/restaurants.js`.
Create documents with IDs `spice-route`, `pizza-party`, and `green-bowl` using that file's
fields and menu items to move the starter data fully into Firestore.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
