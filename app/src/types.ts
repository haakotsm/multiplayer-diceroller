import { S, TypedObject } from "@dxos/echo-schema";
export class DiceResult extends TypedObject({
  typename: "sla.app.DiceResult",
  version: "0.1.0",
})({
  result: S.mutable(S.array(S.number)),
}) {}
