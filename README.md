# pi-ssh-image

Bridge macOS clipboard images into a remote Linux `pi` session over SSH.

This is for the workflow:

```text
macOS / Warp → SSH → Linux / Tailscale → pi
```

When you copy an image on macOS, SSH does not deliver that image to the remote Linux clipboard or to pi. This project gets close to local paste behavior:

1. A macOS daemon watches the clipboard for images.
2. It uploads new images to the Linux host with `scp`.
3. A pi extension on Linux pastes the latest remote image path into the current pi input with `/img` or `ctrl+shift+i`.

## What you get

- `bin/pi-clipboard-daemon` — macOS clipboard watcher/uploader.
- `bin/pi-install-remote-img-helper` — installs an optional `img` command on Linux.
- `extension/pi-latest-image.ts` — pi extension that pastes the latest image path into the input.
- `package.json` — pi package manifest so the extension can be installed from GitHub.

## Requirements

On macOS:

```bash
brew install pngpaste
```

You also need working SSH access to the Linux host, for example:

```bash
ssh user@example-host
```

## Install for your own use

Clone this repo on macOS:

```bash
git clone https://github.com/lucas-stellet/pi-ssh-image.git
cd pi-ssh-image
```

Install the macOS scripts somewhere on your PATH:

```bash
mkdir -p ~/bin
cp bin/pi-clipboard-daemon bin/pi-install-remote-img-helper ~/bin/
chmod +x ~/bin/pi-clipboard-daemon ~/bin/pi-install-remote-img-helper
```

Install the pi extension on the remote Linux host:

```bash
ssh user@example-host 'pi install git:github.com/lucas-stellet/pi-ssh-image'
```

Optional: install the `img` shell helper on Linux:

```bash
~/bin/pi-install-remote-img-helper user@example-host
```

In an already-running pi session on Linux, reload extensions:

```text
/reload
```

Or restart pi.

## Install from GitHub as a pi package

The repository is structured as a pi package. Other users can install the extension directly on the Linux machine where `pi` runs:

```bash
pi install git:github.com/lucas-stellet/pi-ssh-image
```

That installs only the pi-side extension. The macOS daemon still needs to run on the Mac that owns the clipboard:

```bash
git clone https://github.com/lucas-stellet/pi-ssh-image.git
cd pi-ssh-image
mkdir -p ~/bin
cp bin/pi-clipboard-daemon bin/pi-install-remote-img-helper ~/bin/
chmod +x ~/bin/pi-clipboard-daemon ~/bin/pi-install-remote-img-helper
```

## Run the clipboard daemon

On macOS:

```bash
~/bin/pi-clipboard-daemon user@example-host
```

Leave that terminal open. When you copy an image, you should see:

```text
Uploaded: /tmp/pi-images/clip-...
```

To run it in the background:

```bash
PI_CLIPBOARD_REMOTE=user@example-host nohup ~/bin/pi-clipboard-daemon > ~/.pi-clipboard-daemon.log 2>&1 &
```

Check logs:

```bash
tail -f ~/.pi-clipboard-daemon.log
```

Stop it:

```bash
pkill -f pi-clipboard-daemon
```

## Use inside pi

Copy an image on macOS. Then, inside pi on Linux, use either:

```text
/img
```

or:

```text
Ctrl+Shift+I
```

The extension pastes only the path into your current input, such as:

```text
/tmp/pi-images/clip-20260615-115404-a0c3da406f6e2584a1e66821a5dd58e2.png
```

That means you can write around it:

```text
Analyze this screenshot /tmp/pi-images/clip-....png and tell me what is wrong.
```

## Optional LaunchAgent

If you want the daemon to start automatically when you log into macOS, create `~/Library/LaunchAgents/com.pi.clipboard.plist` and replace `user@example-host` and `/Users/you` with your values:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.pi.clipboard</string>
  <key>ProgramArguments</key>
  <array>
    <string>/Users/you/bin/pi-clipboard-daemon</string>
    <string>user@example-host</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/Users/you/.pi-clipboard-daemon.log</string>
  <key>StandardErrorPath</key><string>/Users/you/.pi-clipboard-daemon.err</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
  </dict>
</dict>
</plist>
```

Load it:

```bash
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.pi.clipboard.plist
launchctl enable gui/$(id -u)/com.pi.clipboard
launchctl kickstart -k gui/$(id -u)/com.pi.clipboard
```

## Notes

`Cmd+V` usually cannot be handled by pi over SSH because Warp/macOS intercepts it locally. The extension registers `ctrl+shift+i` because that keypress reaches the remote TUI. You can also configure your terminal to send `/img` if you want a macOS-level shortcut.
