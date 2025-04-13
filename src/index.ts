import 'dotenv/config'
import { server } from "./server/server"
import express from 'express'
import { route } from './server/routes'


const PORT = process.env.PORT || 3000

// const app = express()

// app.use(express.json())
// app.use(express.static("src/public"))
// app.use(route)

//app.listen(PORT, () => console.log(`Server running in address: http://localhost:${PORT}`))


server.listen(PORT, () => console.log(`Server running in address: http://localhost:${PORT}`))

