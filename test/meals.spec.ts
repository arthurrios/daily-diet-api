import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'child_process'

describe('Meals routes', () => {
  let userResponse: request.Response

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('pnpm run knex migrate:rollback --all')
    execSync('pnpm run knex migrate:latest')

    userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndow@gmail.com' })
      .expect(201)
  })

  it('should be able to create a new meal', async () => {
    await request(app.server)
      .post('/meals')
      .set('Cookie', userResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Banana',
        description: 'Some bananas',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)
  })
})
