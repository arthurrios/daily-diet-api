// eslint-disable-next-line
import { Knex } from "knex"

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      session_id: string
      name: string
      email: string
      created_at: Date
      updated_at: Date
    }
    meals: {
      id: string
      user_id: string
      name: string
      description: string
      is_on_diet: boolean
      date: Date
      created_at: Date
      updated_at: Date
    }
  }
}
