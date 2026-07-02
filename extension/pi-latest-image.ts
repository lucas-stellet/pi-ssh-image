import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { readFile } from "node:fs/promises";

const latestFile = "/tmp/pi-images/latest.txt";

async function latestImagePath() {
  const imagePath = (await readFile(latestFile, "utf8")).trim();
  if (!imagePath) throw new Error(`Empty ${latestFile}`);
  return imagePath;
}

async function pasteLatestImagePath(ctx: ExtensionCommandContext) {
  const imagePath = await latestImagePath();
  ctx.ui.pasteToEditor(imagePath);
  ctx.ui.notify("Path da imagem colado no input", "info");
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("img", {
    description: "Cola o path da última imagem sincronizada no input",
    handler: async (_args, ctx) => {
      try {
        await pasteLatestImagePath(ctx);
      } catch (error) {
        ctx.ui.notify(`Falha ao colar path: ${error instanceof Error ? error.message : String(error)}`, "error");
      }
    },
  });

  pi.registerShortcut("ctrl+shift+i", {
    description: "Colar path da última imagem sincronizada",
    handler: async (ctx) => {
      try {
        await pasteLatestImagePath(ctx);
      } catch (error) {
        ctx.ui.notify(`Falha ao colar path: ${error instanceof Error ? error.message : String(error)}`, "error");
      }
    },
  });
}
