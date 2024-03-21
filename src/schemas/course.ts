import { z } from 'zod';

const Room = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(""),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date(),
  taughtById: z.string(),
  organizationId: z.string(),
});

export type Room = z.infer<typeof Room>;
export default Room;