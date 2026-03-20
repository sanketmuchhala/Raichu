import { randomBytes } from 'crypto';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I for readability

/** Generate a 6-character random invite code */
export function generateInviteCode(): string {
  const bytes = randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS[bytes[i] % CHARS.length];
  }
  return code;
}
