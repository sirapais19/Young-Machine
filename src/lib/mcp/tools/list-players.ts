import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_players",
  title: "List players",
  description: "List Young Machine club players with basic profile info.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const players = [
      { id: "1", name: "Alex Novak", position: "Handler", number: 7 },
      { id: "2", name: "Jamie Lee", position: "Cutter", number: 12 },
      { id: "3", name: "Sam Patel", position: "Deep", number: 23 },
    ];
    return {
      content: [{ type: "text", text: JSON.stringify(players, null, 2) }],
      structuredContent: { players },
    };
  },
});
