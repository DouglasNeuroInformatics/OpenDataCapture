export type Sex = 'Male' | 'Female'

export interface Patient {
  firstName: string
  lastName: string
  dateOfBirth: Date
  sex: Sex
}