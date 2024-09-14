import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
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

  it('should be able to list all meals of a verified_user', async () => {
    const cookies = userResponse.get('Set-Cookie') ?? []

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Banana',
        description: 'Some bananas',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Hamburger',
        description: 'Big hamburger',
        isOnDiet: false,
        date: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day after
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(mealsResponse.body.meals[0].name).toBe('Hamburger')
    expect(mealsResponse.body.meals[1].name).toBe('Banana')
  })
})
