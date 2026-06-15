import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { readFile } from "node:fs/promises";

const latestFile = process.env.PI_SSH_IMAGE_LATEST_FILE ?? "/tmp/pi-images/latest.txt";

async function latestImagePath() {
  const imagePath = (await readFile(latestFile, "utf8")).trim();
  if (!imagePath) throw new Error(`Empty ${latestFile}`);
  return imagePath;
}

async function pasteLatestImagePath(ctx: ExtensionCommandContext) {
  const imagePath = await latestImagePath();
  ctx.ui.pasteToEditor(imagePath);
  ctx.ui.notify("Image path pasted into input", "info");
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("img", {
    description: "Paste the latest synced image path into the pi input",
    handler: async (_args, ctx) => {
      try {
        await pasteLatestImagePath(ctx);
      } catch (error) {
        ctx.ui.notify(`Failed to paste image path: ${error instanceof Error ? error.message : String(error)}`, "error");
      }
    },
  });

  pi.registerShortcut("ctrl+shift+i", {
    description: "Paste the latest synced image path",
    handler: async (ctx) => {
      try {
        await pasteLatestImagePath(ctx);
      } catch (error) {
        ctx.ui.notify(`Failed to paste image path: ${error instanceof Error ? error.message : String(error)}`, "error");
      }
    },
  });
}
