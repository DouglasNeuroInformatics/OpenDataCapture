export type Sex = 'Male' | 'Female'

export interface Patient {
  firstName: string
  lastName: string
  dateOfBirth: string | Date // tmp not the same as backend 
  sex: Sex | null
}