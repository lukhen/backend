import { createServer } from "@marblejs/http"
import { bindTo, reader } from "@marblejs/core"
import * as IO from "fp-ts/lib/IO"
import { DependencyToken, listener } from "./http.listener"
import { getToken } from "./functions"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/function"
import * as R from "fp-ts/lib/Reader"
import * as data from "./data"

const dep = getToken({
    getUser: (email, pass) => (
        email === data.admin.email && pass === data.admin.pass ?
            TE.right({ email }) :
            TE.left("user not registered")
    ),
    secret: data.secret
})
const Dep1 = pipe(reader, R.map(() => dep))

const server = createServer({
    port: 1337,
    hostname: '0.0.0.0',
    listener,
    dependencies: [bindTo(DependencyToken)(Dep1)]
})

const main: IO.IO<void> = async () =>
    await (await server)()

main()
