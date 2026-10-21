import type { Lang } from './i18n';

/** Add a public media URL for each supplied narration. Empty entries use the device voice. */
export const timelineRecordings: Record<string, Partial<Record<Lang, string>>> = {
  khanate: {},
  education: {},
  house: {},
  alash: {},
  independence: {},
  constitution: {},
};
