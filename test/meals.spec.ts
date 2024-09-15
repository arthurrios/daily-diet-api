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
  })

  it('should be able to list all meals of a user', async () => {
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
  it('should be able to get a specific meal', async () => {
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

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Banana',
        description: 'Some bananas',
        is_on_diet: 1,
        date: expect.any(Number),
      }),
    )
  })

  it('should be able to update a specific meal', async () => {
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

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Hamburger',
        description: 'Big hamburger',
        isOnDiet: false,
        date: new Date(),
      })
      .expect(204)
  })
  it('should be able to delete a specific meal', async () => {
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

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(204)
  })

  it('should be able to get meals metrics', async () => {
    const cookies = userResponse.get('Set-Cookie') ?? []

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Banana',
        description: 'Some bananas',
        isOnDiet: true,
        date: new Date('2024-08-14T09:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Hamburger',
        description: 'Big hamburger',
        isOnDiet: false,
        date: new Date('2024-08-14T10:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Sandwich',
        description: 'Healthy sandwich',
        isOnDiet: true,
        date: new Date('2024-08-14T14:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Strawberries',
        description: '4 strawberries',
        isOnDiet: true,
        date: new Date('2024-08-14T15:00:00'),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Orange',
        description: '1 orange',
        isOnDiet: true,
        date: new Date('2024-08-14T17:00:00'),
      })
      .expect(201)

    const metricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies)
      .expect(200)

    expect(metricsResponse.body).toEqual({
      totalMeals: 5,
      totalMealsOnDiet: 4,
      totalMealsNotOnDiet: 1,
      bestHealthyStreak: 3,
    })
  })
})
