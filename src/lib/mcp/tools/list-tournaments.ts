import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_tournaments",
  title: "List tournaments",
  description: "List upcoming and past Young Machine tournaments.",
  inputSchema: {
    status: z.enum(["upcoming", "past", "all"]).optional().describe("Filter by status."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ status = "all" }) => {
    const all = [
      { id: "t1", name: "Spring Invitational", date: "2026-04-12", status: "upcoming" },
      { id: "t2", name: "Regional Championship", date: "2026-05-20", status: "upcoming" },
      { id: "t3", name: "Winter Classic", date: "2025-12-05", status: "past" },
    ];
    const items = status === "all" ? all : all.filter((t) => t.status === status);
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { tournaments: items },
    };
  },
});
