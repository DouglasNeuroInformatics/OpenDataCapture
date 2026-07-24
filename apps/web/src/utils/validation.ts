export const PHONE_REGEX = new RegExp(/^(?=.{5,})\+?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/);

export const MIN_PHONE_DIGITS = 7;

export function countPhoneDigits(phone: string): number {
  return phone.replace(/\D/g, '').length;
}
