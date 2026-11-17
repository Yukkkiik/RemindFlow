import { TaskRepository } from "../repositories/task.repository";
import { computeActivity, computeProgress, rangeBounds, ProgressRange } from "@/lib/progress";
import { DEFAULT_TIMEZONE } from "@/utils/date";

export class ProgressService {
  static async getProgress(userId: string, range: ProgressRange) {
    const now = new Date();
    const timeZone = DEFAULT_TIMEZONE;
    const { startKey, todayKey } = rangeBounds(now, timeZone, range);

    // dueDate is stored as UTC midnight of the calendar date, hence the T00:00:00Z bounds
    const tasks = await TaskRepository.findForProgress(
      userId,
      new Date(`${startKey}T00:00:00.000Z`),
      new Date(`${todayKey}T00:00:00.000Z`)
    );

    return {
      ...computeProgress(tasks, { now, timeZone, range }),
      activity: computeActivity(tasks, { now, timeZone }),
    };
  }
}
