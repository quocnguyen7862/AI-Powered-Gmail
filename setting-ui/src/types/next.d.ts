import { Session } from 'next-auth';

declare module 'next' {
  interface NextApiRequest extends NextApiRequest {
    user: Partial<Session.user>;
  }
}

declare module '*.scss';

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}
