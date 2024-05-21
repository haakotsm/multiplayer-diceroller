import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// This includes css styles from @dxos/react-ui-theme.
// This must precede all other style imports in the app.
import "@dxosTheme";


import { Config, Defaults } from "@dxos/config";
import { initializeAppObservability } from '@dxos/observability';
import * as Sentry from "@sentry/react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { DiceRoller } from "./components/DiceRoller";
import { Root } from "./components/Root";

Sentry.init({
    dsn: "https://30433f85c96c37c362115972bf0f08f0@o4507296312262656.ingest.de.sentry.io/4507296313835600",
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});


void initializeAppObservability({ namespace: "diceroller", config: new Config(Defaults()) })

const router = createBrowserRouter([{
    path: "/",
    element: <Root />,
    children: [
        { path: "/", element: <DiceRoller /> },
        { path: ":spaceKey", element: <DiceRoller /> },
        { path: ":spaceKey/:state", element: <DiceRoller /> },
    ],
}])
const App = Sentry.withProfiler(() => <RouterProvider router={router} />)

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
