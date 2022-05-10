import { failTest, getToken, getUserFT, Deps } from "./functions"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import * as jwt from "jsonwebtoken"
import * as TCP4 from "./taskcoproduct4"
import * as T from "fp-ts/lib/Task"

describe("getToken", () => {

    test("retrieving user successfull", async () => {

        const successfulGetUser: getUserFT =
            (email, pass) => TE.right({ email: "", pass: "" })

        const deps: Deps = {
            getUser: successfulGetUser,
            secret: "some secret"
        }

        const email = "some@email",
            pass = "password"


        const t = await pipe(
            TCP4.fromPairOfSums(successfulGetUser(email, pass), getToken(deps)(email, pass)),
            TCP4.fold(
                _ => T.of(failTest("")),
                _ => T.of(failTest("")),
                _ => T.of(failTest("")),
                ([ud, token]) => T.of(() => {
                    expect(token).toEqual({ user: jwt.sign(ud.email, deps.secret) })
                })
            )
        )()
        t()
    })


    test("retrieving user failing", async () => {

        const failingGetUser: getUserFT =
            (email, pass) => TE.left("user does not exist")

        const email = "some@email",
            pass = "some secret"

        const deps: Deps = {
            getUser: failingGetUser,
            secret: "some secret"
        }

        const t = await pipe(
            TCP4.fromPairOfSums(failingGetUser(email, pass), getToken(deps)(email, pass)),
            TCP4.fold(
                ([errMsg1, errMsg2]) => T.of(() => { expect(errMsg1).toEqual(errMsg2) }),
                _ => T.of(failTest("")),
                _ => T.of(failTest("")),
                _ => T.of(failTest(""))
            )
        )()
        t()
    })
})
