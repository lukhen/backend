import {
    responseFromRequest,
    EMPTY_REQUEST_ERROR_MSG,
    REQUEST_WITH_NO_PASSWORD_ERROR_MSG,
    REQUEST_WITH_NO_EMAIL_ERROR_MSG,
    responseForRequestWithUserData,
    failTest,
    getTokenFT
} from "./functions"
import { pipe } from "fp-ts/lib/function"
import * as TE from "fp-ts/lib/TaskEither"
import * as T from "fp-ts/lib/Task"
import * as TaskCoproduct4 from "./taskcoproduct4"

describe("responseFromRequest", () => {
    test("empty request body", async () => {
        const EMPTY_OBJECT = {}

        const irrelevantGetToken: getTokenFT =
            _ => TE.right({ user: "" })

        const resp = responseFromRequest({ body: EMPTY_OBJECT, headers: {} })(irrelevantGetToken)
        const t = await pipe(
            resp,
            TE.fold(
                errResp => T.of(() => { expect(errResp.body).toEqual(EMPTY_REQUEST_ERROR_MSG) }),
                _ => T.of(failTest("This should not execute"))
            )
        )()
        t()
    })

    test("body with email, but no password ", async () => {
        const irrelevantGetToken: getTokenFT =
            _ => TE.right({ user: "" })

        const t = await pipe(
            responseFromRequest({ body: { email: "some@email.org" }, headers: {} })(irrelevantGetToken),
            TE.fold(
                errResp => T.of(() => { expect(errResp.body).toEqual(REQUEST_WITH_NO_PASSWORD_ERROR_MSG) }),
                _ => T.of(failTest("This should not execute"))
            )
        )()
        t()
    })

    test("body with password, but no email ", async () => {
        const irrelevantGetToken: getTokenFT =
            _ => TE.right({ user: "" })

        const t = await pipe(
            responseFromRequest({ body: { pass: "secret" }, headers: {} })(irrelevantGetToken),
            TE.fold(
                errResp => T.of(() => { expect(errResp.body).toEqual(REQUEST_WITH_NO_EMAIL_ERROR_MSG) }),
                _ => T.of(failTest("This should not execute"))
            )
        )()
        t()
    })

    test("body with email and password ", async () => {
        const req = { body: { email: "some@email.org", pass: "secret" }, headers: {} }

        const irrelevantGetToken: getTokenFT =
            _ => TE.right({ user: "" })

        const x = TaskCoproduct4.fromPairOfSums(responseFromRequest(req)(irrelevantGetToken), responseForRequestWithUserData(req)(irrelevantGetToken))

        const t = await pipe(
            x,
            TaskCoproduct4.fold(
                ([resp, exp]) => T.of(() => { expect(resp.body).toEqual(exp.body) }),
                _ => T.of(failTest("resp and exp are different")),
                _ => T.of(failTest("resp and exp are different")),
                ([resp, exp]) => T.of(() => { expect(resp.body).toEqual(exp.body) })
            )
        )()
        t()
    })
})
