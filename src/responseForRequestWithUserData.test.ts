import { pipe } from "fp-ts/lib/function"
import { responseForRequestWithUserData, Req, AuthenticationData, failTest, getTokenFT } from "./functions"
import * as T from "fp-ts/lib/Task"
import * as TaskCoproduct4 from "./taskcoproduct4"
import * as TE from "fp-ts/lib/TaskEither"
describe("responseForRequestWithUserData", () => {
    test("retireving token successfull", async () => {

        const req: Req<AuthenticationData> = {
            body: { email: "some@email.org", pass: "secret" },
            headers: {}
        }

        const succesfullDep: getTokenFT =
            (email, pass) => TE.right({ user: "some_user" })

        const resp = responseForRequestWithUserData(req)(succesfullDep)

        const t = await pipe(
            TaskCoproduct4.fromPairOfSums(resp, succesfullDep(req.body.email, req.body.pass)),
            TaskCoproduct4.fold(
                (_) => T.of(failTest("This should not execute")),
                (_) => T.of(failTest("This should not execute")),
                (_) => T.of(failTest("This should not execute")),
                ([resp, token]) => T.of(() => { expect(resp.body).toEqual(token) })
            )
        )()
        t()
    })

    test("retireving token failed", async () => {

        const req: Req<AuthenticationData> = {
            body: { email: "not_existing@email.org", pass: "secret" },
            headers: {}
        }

        const failingDep: getTokenFT =
            (email, pass) => TE.left("unreg user")

        const resp = responseForRequestWithUserData(req)(failingDep)

        const t = await pipe(
            TaskCoproduct4.fromPairOfSums(resp, failingDep(req.body.email, req.body.pass)),
            TaskCoproduct4.fold(
                ([errResp, errMsg]) => T.of(() => { expect(errResp.body).toEqual(errMsg) }),
                (_) => T.of(failTest("This should not execute")),
                (_) => T.of(failTest("This should not execute")),
                (_) => T.of(failTest("This should not execute"))
            )
        )()
        t()
    })
})
