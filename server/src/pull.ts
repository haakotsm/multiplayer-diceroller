import type {NextFunction, Request, Response} from 'express';
import type {PatchOperation, PullResponse} from 'replicache';
import {serverID, tx, type Transaction} from './db';

export async function handlePull(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const resp = await pull(req, res);
    res.json(resp);
  } catch (e) {
    next(e);
  }
}

async function pull(req: Request, res: Response) {
  const pull = req.body;
  console.log(`Processing pull`, JSON.stringify(pull));
  const {clientGroupID} = pull;
  const fromVersion = pull.cookie ?? 0;
  const t0 = Date.now();

  try {
    // Read all data in a single transaction so it's consistent.
    await tx(async t => {
      // Get current version.
      const {version: currentVersion} = await t.one<{version: number}>(
        'select version from replicache_server where id = $1',
        serverID,
      );

      if (fromVersion > currentVersion) {
        throw new Error(
          `fromVersion ${fromVersion} is from the future - aborting. This can happen in development if the server restarts. In that case, clear appliation data in browser and refresh.`,
        );
      }

      // Get lmids for requesting client groups.
      const lastMutationIDChanges = await getLastMutationIDChanges(
        t,
        clientGroupID,
        fromVersion,
      );

      // Get changed domain objects since requested version.
      const changed = await t.manyOrNone<{
        id: string;
        user_id: string;
        result: number[];
        timestamp: string;
        deleted: boolean;
        version: number;
      }>(
        'select id, user_id, result, timestamp, deleted, version from dice_roll where version > $1',
        fromVersion,
      );
      console.log('changed', changed);

      // Build and return response.
      const patch: PatchOperation[] = [];
      for (const row of changed) {
        const {
          id,
          user_id,
          result,
          timestamp,
          deleted,
          version: rowVersion,
        } = row;
        if (deleted) {
          if (rowVersion > fromVersion) {
            patch.push({
              op: 'del',
              key: `roll_dice/${id}`,
            });
          }
        }
        patch.push({
          op: 'put',
          key: `roll_dice/${id}`,
          value: {
            user_id,
            result,
            timestamp,
          },
        });
      }

      const body: PullResponse = {
        lastMutationIDChanges: lastMutationIDChanges ?? {},
        cookie: currentVersion,
        patch,
      };
      res.json(body);
      res.end();
    });
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  } finally {
    console.log('Processed pull in', Date.now() - t0);
  }
}

async function getLastMutationIDChanges(
  t: Transaction,
  clientGroupID: string,
  fromVersion: number,
) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const rows = await t.manyOrNone<{id: string; last_mutation_id: number}>(
    `select id, last_mutation_id
    from replicache_client
    where client_group_id = $1 and version > $2`,
    [clientGroupID, fromVersion],
  );
  return Object.fromEntries(rows.map(r => [r.id, r.last_mutation_id]));
}
