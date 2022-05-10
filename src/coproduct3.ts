import * as E from "fp-ts/lib/Either"

export type Coproduct3<A, B, C> = E.Either<A, E.Either<B, C>>

export function a<A>(v: A): Coproduct3<A, any, any> { return E.left(v) }
export function b<B>(v: B): Coproduct3<any, B, any> { return E.right(E.left(v)) }
export function c<C>(v: C): Coproduct3<any, any, C> { return E.right(E.right(v)) }

export function fold<A, B, C, R>(
    onA: (v: A) => R,
    onB: (v: B) => R,
    onC: (v: C) => R
): (c: Coproduct3<A, B, C>) => R {
    return E.fold(onA, E.fold(onB, onC))
}
