import { Filter, Space, SpaceState, create, useQuery } from "@dxos/react-client/echo";
import React, { useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { DiceResult } from "../types";

export function DiceRoller() {
    const { space } = useOutletContext<{ space: Space | undefined }>();
    const { state } = useParams();
    const [results] = useQuery<DiceResult>(space, Filter.schema(DiceResult))
    useEffect(() => {
        if (space && space.state.get() === SpaceState.READY && !results) {
            space.db.add(create(DiceResult, { result: [] }));
        }
    }, [space, results]);

    return (
        <div>
            {results && (
                <div className='text-center'>
                    <button
                        className='border bg-white py-2 px-4 rounded'
                        onClick={() => {
                            results.result.push(1);
                        }}
                    >
                        Click me
                    </button>
                    <p>Clicked {results.result.length ?? 0} times.</p>
                </div>
            )}
        </div>
    );
};
