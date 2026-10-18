import { z } from "zod";
import { LIMITS } from "@/config/constants";
import { byteLength } from "@/lib/utils";

const noAngleBrackets = (value: string) => !/[<>]/.test(value);

export const publishSchema = z
  .object({
    storageFileId: z.string().min(1, "Choose a video from Storage."),
    thumbnailFileId: z.string().nullable(),
    title: z
      .string()
      .trim()
      .min(1, "Add a title.")
      .max(LIMITS.titleMax, `Use at most ${LIMITS.titleMax} characters.`)
      .refine(noAngleBrackets, "Titles cannot contain < or >."),
    description: z
      .string()
      .refine(
        (value) => byteLength(value) <= LIMITS.descriptionMaxBytes,
        `Descriptions are limited to ${LIMITS.descriptionMaxBytes} bytes.`,
      )
      .refine(noAngleBrackets, "Descriptions cannot contain < or >."),
    tags: z
      .array(z.string())
      .refine(
        (tags) => tags.join(",").length <= LIMITS.tagsTotalMax,
        `Tags can total at most ${LIMITS.tagsTotalMax} characters.`,
      ),
    categoryId: z.string().min(1),
    privacy: z.enum(["public", "unlisted", "private"]),
    schedule: z.boolean(),
    publishAt: z.string(),
    madeForKids: z.boolean(),
    notifySubscribers: z.boolean(),
    language: z.string(),
    accountIds: z
      .array(z.string())
      .min(1, "Choose at least one channel.")
      .max(LIMITS.maxChannelsPerUpload, `Choose at most ${LIMITS.maxChannelsPerUpload} channels.`),
  })
  .superRefine((values, context) => {
    if (!values.schedule) return;
    const when = new Date(values.publishAt);
    if (!values.publishAt || Number.isNaN(when.getTime())) {
      context.addIssue({ code: "custom", path: ["publishAt"], message: "Pick a date and time." });
    } else if (when.getTime() < Date.now() + 5 * 60_000) {
      context.addIssue({
        code: "custom",
        path: ["publishAt"],
        message: "Choose a time at least 5 minutes from now.",
      });
    }
  });

export type PublishValues = z.infer<typeof publishSchema>;
