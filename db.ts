import {AppDataSource} from './data-source'
import GymSet from './gym-set'
import {Plan} from './plan'
import Settings from './settings'

export const setRepo = AppDataSource.manager.getRepository(GymSet)
export const planRepo = AppDataSource.manager.getRepository(Plan)
export const settingsRepo = AppDataSource.manager.getRepository(Settings)

export const getNow = (): Promise<{now: string}[]> => {
  return AppDataSource.manager.query(
    "SELECT STRFTIME('%Y-%m-%dT%H:%M:%S','now','localtime') AS now",
  )
}
