import { httpListener, HttpRequest } from "@marblejs/http"
import { logger$ } from "@marblejs/middleware-logger"
import { bodyParser$ } from "@marblejs/middleware-body"
import { r } from "@marblejs/http"
import { map, mergeMap } from "rxjs/operators"
import { getTokenFT, responseFromRequest } from "./functions"
import * as TE from "fp-ts/lib/TaskEither"
import * as T from "fp-ts/lib/Task"
import { from } from "rxjs"
import { pipe } from "fp-ts/lib/function"
import * as O from "fp-ts/lib/Option"
import { createContextToken } from '@marblejs/core'

const middlewares = [
    logger$(),
    bodyParser$()
]

const api$ = r.pipe(
    r.matchPath('/login'),
    r.matchType("POST"),

    r.useEffect((req$, ctx) => {

        const getToken: getTokenFT = pipe(
            ctx.ask(DependencyToken),
            O.getOrElse(() => (email, pass) => TE.left("dupa"))
        )

        return req$.pipe(
            map(r => responseFromRequest(r)(getToken)),
            map(TE.foldW(
                badResp => T.of(badResp),
                goodResp => T.of(goodResp)
            )),
            mergeMap(x => from(x()))
        )
    })
)

const effects = [
    api$
]
export const listener = httpListener({
    middlewares,
    effects
})

export const DependencyToken = createContextToken<getTokenFT>("Dependency")
