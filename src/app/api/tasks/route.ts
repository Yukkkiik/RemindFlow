import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { TaskService } from "@/server/services/task.service";
import { createTaskSchema, taskQuerySchema } from "@/lib/validation/task.schema";
import { Priority, TaskStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);

    const filter = searchParams.get("filter") as "ALL" | "TODAY" | "UPCOMING" | "COMPLETED" | null;
    const status = searchParams.get("status") as TaskStatus | null;
    const priority = searchParams.get("priority") as Priority | null;
    const categoryId = searchParams.get("categoryId") || undefined;
    const search = searchParams.get("search") || undefined;

    const validatedQuery = taskQuerySchema.safeParse({
      filter: filter || undefined,
      status: status || undefined,
      priority: priority || undefined,
      categoryId,
      search,
    });

    if (!validatedQuery.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Parameter pencarian tidak valid",
          details: validatedQuery.error.format(),
        },
        { status: 400 }
      );
    }

    const tasks = await TaskService.getTasks(user.id, validatedQuery.data);

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const validation = createTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data tugas tidak valid",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const task = await TaskService.createTask(user.id, validation.data);

    return NextResponse.json(
      {
        success: true,
        message: "Tugas berhasil dibuat",
        data: task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat tugas",
      },
      { status: 500 }
    );
  }
}
