import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { fastifyMultipart } from '@fastify/multipart'
import { request } from 'node:http'
import type { FastifyInstance } from "fastify";
import { R2StorageProvider } from './storage/providers/r2-storage';
import { UploadImageToStorage } from './functions/upload-image-to-storage';


// Create a Fastify server instance
const server = fastify()

// Register CORS and multipart plugins
server.register(fastifyCors, {
  origin: '*',
  methods: ['POST', 'GET', 'OPTIONS']
})

// Register the multipart plugin to handle file uploads
server.register(fastifyMultipart)

const MAXIMUM_FILE_SIZE_IN_BYTES = 1024 * 1024 * 4 // 4mb
 

server.post('/uploads', async (request, reply) => {

    request.log.info('Received file upload request.')

    const uploadedFile = await request.file({
      limits: { fileSize: MAXIMUM_FILE_SIZE_IN_BYTES },
    })

    if (!uploadedFile) {
      return reply.status(400).send({ message: 'Invalid file provided.' })
    }

    const { filename, file: contentStream, mimetype } = uploadedFile

    try {
      const storageProvider = new R2StorageProvider()
    const uploadImageToStorage = new UploadImageToStorage(storageProvider)

    const { url } = await uploadImageToStorage.execute({
      name: uploadedFile.filename,
      contentStream:uploadedFile.file,
      contentType: uploadedFile.mimetype,
    })

    if (uploadedFile.file.truncated) {
      return reply.status(413).send({
        message: `File size must be a maximum of 4MB..`,
      })
    }

    return reply.status(201).send({ url })
    } catch (error) {
      return reply.status(500).send({ message: 'Erro interno ao salvar no R2.' })
    }
  })


server.get('/', async (request, reply) => {
  return reply.status(200).send("Hello World")
})






server.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log(`Server is running at http://localhost:3333`)
})