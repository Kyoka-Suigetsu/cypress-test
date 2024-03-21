import { z } from "zod";

export const SVoiceCloningForm = z
  .object({
    name: z.string().min(1, { message: "A name is required *" }).max(25),
    file: z.custom<File>(),
  })
  .superRefine(({ file }, ctx) => {
    if (file === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["file"],
        message: "A audio file is required *",
      });
      return;
    }

    const fileType = file.name.split(".").pop() ?? "no file type found";
    if (!["wav", "mp3", "opus"].includes(fileType)) {
      ctx.addIssue({
        code: "custom",
        path: ["file"],
        message: "File type must be .wav, .mp3, or .opus",
      });
    }

    return file;
  });

export type TVoiceCloningForm = z.infer<typeof SVoiceCloningForm>;
