export interface IDateService {
    now(): Date,
}

export const defaultDateService: IDateService = {
  now: () => new Date()
};