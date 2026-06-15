# Context

This project solves a remote-SSH clipboard gap:

- User works on macOS, often in Warp.
- User connects over SSH to a Linux machine, often over Tailscale.
- `pi` runs on the Linux machine.
- Images copied on macOS do not automatically reach the remote Linux terminal/pi input.

The bridge has two sides:

1. A macOS daemon watches the local clipboard with `pngpaste`. When it sees a new image, it writes a temporary PNG, hashes it, uploads it to the Linux host via `scp`, and updates `/tmp/pi-images/latest.txt` with the remote image path.
2. A pi extension on the Linux host adds `/img` and `ctrl+shift+i`. Instead of submitting a prompt, it pastes only the latest image path into the current pi input so the user can use that path in the middle of a larger message.

The shell helper `img` is optional but useful outside pi. It prints the path stored in `/tmp/pi-images/latest.txt`.

Known limitation: `Cmd+V` is intercepted by macOS/Warp and is not visible as a keypress inside the SSH session. Use a pi shortcut that reaches Linux, or configure Warp to send `/img` plus Enter/a key sequence if desired.
