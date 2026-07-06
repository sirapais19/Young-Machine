import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "club_info",
  title: "Club info",
  description: "Get basic information about the Young Machine (YM) frisbee club.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      name: "Young Machine",
      shortName: "YM",
      sport: "Ultimate Frisbee",
      description: "A modern competitive ultimate frisbee club focused on player development.",
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
