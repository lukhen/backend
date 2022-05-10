import express from "express"
import logger from "morgan"
import path from "path"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(logger('dev'))
app.use(cookieParser())
app.use(cors())

app.get("/login", (req, res) => {
    res.send("main")
})

export default app
