import { ClientProvider } from "@dxos/react-client";
import { Status, ThemeProvider } from "@dxos/react-ui";
import { defaultTx } from "@dxos/react-ui-theme";
import React from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { ErrorBoundary } from "../ErrorBoundary";
import { getConfig } from "../config";
import translations from "../translations";
import { DiceResult } from "../types";
import { Main } from "./Main";


const createWorker = () =>
  new SharedWorker(new URL("./shared-worker", import.meta.url), {
    type: "module",
    name: "dxos-client-worker",
  });

const Loader = () => (
  <div className="flex bs-[100dvh] justify-center items-center">
    <Status indeterminate aria-label="Initializing" />
  </div>
);

export const Root = () => {
  const navigate = useNavigate()
  return (
    <ThemeProvider
      appNs="app"
      tx={defaultTx}
      resourceExtensions={translations}
      fallback={<Loader />}
    >
      <ErrorBoundary>
        <ClientProvider
          config={getConfig}
          createWorker={createWorker}
          shell="./shell.html"
          fallback={Loader}
          onInitialized={async (client) => {
            client.addSchema(DiceResult);

            const searchParams = new URLSearchParams(location.search);
            const deviceInvitationCode = searchParams.get('deviceInvitationCode');
            if (!client.halo.identity.get() && !deviceInvitationCode) {
              await client.halo.createIdentity();
            }

            const spaceInvitationCode = searchParams.get('spaceInvitationCode');
            if (spaceInvitationCode) {
              void client.shell.joinSpace({ invitationCode: spaceInvitationCode }).then(({ space }) => {
                space && navigate(generatePath('/:spaceKey', { spaceKey: space.key.toHex() }));
              });
            } else if (deviceInvitationCode) {
              void client.shell.initializeIdentity({ invitationCode: deviceInvitationCode });
            }
          }}
        >
          <Main />
        </ClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};
