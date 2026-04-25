import { getRequestListener } from '@hono/node-server'
import app from './boot'

const handler = getRequestListener(app as any)
export default handler
