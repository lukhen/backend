import * as Coproduct3 from "./coproduct3"
import { HttpHeaders } from "@marblejs/http"
import * as E from "fp-ts/lib/Either"
import { flow, identity, pipe } from "fp-ts/lib/function"
import { Predicate } from "fp-ts/lib/Predicate"
import * as TE from "fp-ts/lib/TaskEither"
import { IO } from "fp-ts/lib/IO"
import { Reader } from "fp-ts/lib/Reader"
import * as jwt from "jsonwebtoken"

export function normalizePort(val: string): Coproduct3.Coproduct3<string, number, false> {
    const port = parseInt(val, 10)

    if (isNaN(port)) {
        return Coproduct3.a(val)
    }

    if (port >= 0) {
        return Coproduct3.b(port)
    }

    return Coproduct3.c(false)
}

export interface AuthenticationData {
    email: string,
    pass: string
}

export interface UserData {
    email: string
}

interface Token {
    user: string
}

export interface Req<A> {
    body: A,
    headers: HttpHeaders
}

interface Resp<A> {
    body: A,
    headers: HttpHeaders
}

type Err = string

export const EMPTY_REQUEST_ERROR_MSG = "empty request"
export const REQUEST_WITH_NO_PASSWORD_ERROR_MSG = "no password"
export const REQUEST_WITH_NO_EMAIL_ERROR_MSG = "no email"

type responseForInvalidRequestFT = (errorMsg: Err) => Resp<Err>
const responseForInvalidRequest: responseForInvalidRequestFT =
    errorMsg => ({
        body: errorMsg,
        headers: {}
    })

const isEmpty: Predicate<unknown> = o => Object.keys(o as Record<string, unknown>).length !== 0

const hasPassword: Predicate<unknown> = (
    o: unknown): boolean => (o as AuthenticationData).pass !== undefined

const hasEmail: Predicate<unknown> = (
    o: unknown): boolean => (o as AuthenticationData).email !== undefined

type validateUserDataFT = (v: unknown) => E.Either<Err, AuthenticationData>
const validateUserData: validateUserDataFT =
    flow(
        E.fromPredicate(hasPassword, () => REQUEST_WITH_NO_PASSWORD_ERROR_MSG),
        E.chain(E.fromPredicate(hasEmail, () => REQUEST_WITH_NO_EMAIL_ERROR_MSG)),
        E.map(a => a as AuthenticationData)
    )

export type getTokenFT = (email: string, pass: string) => TE.TaskEither<Err, Token>

// !!!
type responseForRequestWithUserDataFT = (req: Req<AuthenticationData>) => Reader<getTokenFT, TE.TaskEither<Resp<Err>, Resp<Token>>>
export const responseForRequestWithUserData: responseForRequestWithUserDataFT =
    req => getToken => pipe(
        req.body,
        authenticationData => getToken(authenticationData.email, authenticationData.pass),
        TE.bimap(
            err => ({
                body: err,
                headers: {}
            }),
            token => ({
                body: token,
                headers: {}
            })
        )
    )

/*
  Produce http response.
*/
type responseFromRequestFT = (request: Req<unknown>) => Reader<getTokenFT, TE.TaskEither<Resp<Err>, Resp<Token>>>
export const responseFromRequest: responseFromRequestFT =
    request => (
        pipe(
            request.body,
            E.fromPredicate(isEmpty, () => EMPTY_REQUEST_ERROR_MSG),
            E.chain(validateUserData),
            E.bimap(
                (errmsg: Err) => responseForInvalidRequest(errmsg),
                userdata => responseForRequestWithUserData(request as Req<AuthenticationData>)),
            E.fold(
                respErr => _ => TE.left(respErr),
                identity
            )
        ))

export const failTest: (msg: string) => IO<void> =
    msg => () => { expect(msg).toEqual(0) } // always fails


export type Deps = {
    getUser: getUserFT,
    secret: string
}
export type getUserFT = (email: string, pass: string) => TE.TaskEither<Err, UserData>

export const getToken: Reader<Deps, getTokenFT> =
    deps => (email, pass) => pipe(
        deps.getUser(email, pass),
        TE.map(ud => ({ user: jwt.sign(ud.email, deps.secret) }))
    )

