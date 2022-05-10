import { listener, DependencyToken } from "./http.listener"
import { createHttpTestBed } from "@marblejs/testing"
import { pipe } from "fp-ts/lib/function"
import * as TE from "fp-ts/lib/TaskEither"
import { getTokenFT, responseFromRequest } from "./functions"
import * as T from "fp-ts/lib/Task"
import { reader, bindTo } from '@marblejs/core'
import * as R from "fp-ts/lib/Reader"

const httpTestBed = createHttpTestBed({ listener })


describe("Walking skeleton test", () => {
    test("", async () => {
        const fakeGetToken: getTokenFT =
            (email, pass) => TE.right({ user: "someUser" })

        const Dependency = pipe(reader, R.map(() => fakeGetToken))
        const dependencies = [
            bindTo(DependencyToken)(Dependency)
        ]

        const { request, finish } = await httpTestBed(dependencies)

        const req = pipe(
            request("POST"),
            request.withPath("/login"),
            request.withHeaders({ "Content-Type": "application/json" }),
            request.withBody({ some: "irrelevant request body" }),

        )

        const response = await request.send(req)
        const exp = responseFromRequest(req)(fakeGetToken)

        expect(response.statusCode).toEqual(200)
        const t = await pipe(
            exp,
            TE.fold(
                badResp => T.of(() => { expect(response.body).toEqual(badResp.body) }),
                goodResp => T.of(() => { expect(response.body).toEqual(goodResp.body) })
            ))()

        t()
        await finish();
    })
})
