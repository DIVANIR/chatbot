import os from 'os'
import 'dotenv/config'
import { server } from "./server/server"


const PORT = process.env.PORT || 3000
const ETHERNET = os.networkInterfaces().Ethernet
const ADDRESS_SERVER = ETHERNET ? ETHERNET.find(({ family }) => family === "IPv4") : { address: "localhost" }

server.listen(PORT, () => console.log(`Server running in address: http://localhost:${PORT}`, ADDRESS_SERVER))

