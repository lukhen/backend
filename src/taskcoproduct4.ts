import * as E from "fp-ts/lib/Either"
import * as TE from "fp-ts/lib/TaskEither"
import * as T from "fp-ts/lib/Task"
import { pipe } from "fp-ts/lib/function"
export type TaskCoproduct4<A, B, C, D> = TE.TaskEither<A, TE.TaskEither<B, TE.TaskEither<C, D>>>

export function a<A>(v: A): TaskCoproduct4<A, any, any, any> { return TE.left(v) }
export function b<B>(v: B): TaskCoproduct4<any, B, any, any> { return TE.right(TE.left(v)) }
export function c<C>(v: C): TaskCoproduct4<any, any, C, any> { return TE.right(TE.right(TE.left(v))) }
export function d<D>(v: D): TaskCoproduct4<any, any, any, D> { return TE.right(TE.right(TE.right(v))) }

export function fold<A, B, C, D, R>(
    onA: (v: A) => T.Task<R>,
    onB: (v: B) => T.Task<R>,
    onC: (v: C) => T.Task<R>,
    onD: (v: D) => T.Task<R>
): (c: TaskCoproduct4<A, B, C, D>) => T.Task<R> {
    return TE.fold(onA, TE.fold(onB, TE.fold(onC, onD)))
}

type fromPairOfSumsFT = <A, B, C, D>(ab: TE.TaskEither<A, B>, cd: TE.TaskEither<C, D>) => TaskCoproduct4<[A, C], [A, D], [B, C], [B, D]>
export const fromPairOfSums: fromPairOfSumsFT = <A, B, C, D>(ab: TE.TaskEither<A, B>, cd: TE.TaskEither<C, D>) => (
    pipe(
        ab,
        TE.fold(
            x => pipe(
                cd,
                TE.fold(
                    y => a([x, y]),
                    z => b([x, z])
                )
            ),
            y => pipe(
                cd,
                TE.fold(
                    q => c([y, q]),
                    r => d([y, r])
                )
            )
        )

    )
)
