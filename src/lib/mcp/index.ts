import { defineMcp } from "@lovable.dev/mcp-js";
import clubInfoTool from "./tools/club-info";
import listPlayersTool from "./tools/list-players";
import listTournamentsTool from "./tools/list-tournaments";

export default defineMcp({
  name: "young-machine-mcp",
  title: "Young Machine Club MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Young Machine (YM) frisbee club management app. Use `club_info` for club details, `list_players` for the roster, and `list_tournaments` for tournament schedule.",
  tools: [clubInfoTool, listPlayersTool, listTournamentsTool],
});
