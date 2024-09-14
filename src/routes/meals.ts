import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date(),
      })

      const { name, description, isOnDiet, date } = createMealBodySchema.parse(
        request.body,
      )

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        is_on_diet: isOnDiet,
        date,
        user_id: request.user?.id,
      })

      return reply.status(201).send()
    },
  )

  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const meals = await knex('meals')
      .where({
        user_id: request.user?.id,
      })
      .orderBy('date', 'desc')
    return { meals }
  })

  app.get('/:mealId', async (request, reply) => {
    const getMealParamsSchema = z.object({
      mealId: z.string().uuid(),
    })

    const { mealId } = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals')
      .where({
        id: mealId,
      })
      .first()

    if (!meal) {
      return reply.status(404).send({ error: 'Meal not found' })
    }

    return { meal }
  })

  app.put('/:mealId', async (request, reply) => {
    const getMealParamsSchema = z.object({
      mealId: z.string().uuid(),
    })

    const { mealId } = getMealParamsSchema.parse(request.params)

    const updateMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isOnDiet: z.boolean(),
      date: z.coerce.date(),
    })

    const { name, description, isOnDiet, date } = updateMealBodySchema.parse(
      request.body,
    )

    const meal = await knex('meals')
      .where({
        id: mealId,
      })
      .first()

    if (!meal) {
      return reply.status(404).send({ error: 'Meal not found' })
    }

    await knex('meals').where({ id: mealId }).update({
      name,
      description,
      is_on_diet: isOnDiet,
      date,
    })

    return reply.status(204).send()
  })
}
