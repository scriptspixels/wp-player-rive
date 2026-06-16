=== MotionPlayer for Rive ===
Tags: rive, animation, block, gutenberg, media
Requires at least: 6.0
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 0.1.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embed Rive (.riv) animations in the block editor. Free version: pick a file from the media library, set canvas size, optional accessible name. A MotionPlayer Pro upgrade is planned for advanced player controls.

== Description ==

**MotionPlayer for Rive** adds a **MotionPlayer: Rive** block so you can upload or select `.riv` files from the Media Library and play them on the front end.

= Free version (this plugin) =

* Gutenberg block with media picker for `.riv` files
* Canvas width and height in the block sidebar
* Optional accessible name for the canvas
* Live preview in the editor (WebGL2)
* Front-end playback using the bundled **@rive-app/webgl2** runtime (Rive Renderer), so shadows, gradients, and blend modes match how files are authored

= MotionPlayer Pro (coming later) =

A future **Pro** add-on will extend the player with additional controls and features. This repository release is the **free** base plugin only.

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/`, or install the ZIP from the Plugins screen in WordPress.
2. Activate **MotionPlayer for Rive** through the **Plugins** menu.
3. Edit a post or page, insert **MotionPlayer: Rive**, and choose a `.riv` file.

== Frequently Asked Questions ==

= Does this work only in the block editor? =

Yes. The block is registered for the block editor.

= Where does the Rive runtime load from? =

The plugin ships the official **@rive-app/webgl2** UMD bundle (`rive.js`) and its WebAssembly file (`rive.wasm`) inside the plugin. No remote JavaScript or CDN is required for playback.

= Why WebGL2? =

The WebGL2 (Rive Renderer) path supports advanced visuals—drop shadows, gradients, blend modes, vector feathering—that the older canvas-only runtime does not render the same way.

= Will this work without JavaScript or WebGL2? =

No. Playback requires JavaScript and a browser with WebGL2 support.

== Screenshots ==

1. MotionPlayer: Rive block in the editor with media controls
2. Canvas and accessibility options in the block sidebar
3. Animation playing on the front end

== Upgrade Notice ==

= 0.1.1 =
Bundles the Rive WebGL2 runtime locally (no CDN dependency).

= 0.1.0 =
Initial WordPress.org release of the free MotionPlayer for Rive block.

== Changelog ==

= 0.1.1 =
* Bundle the @rive-app/webgl2 runtime and WASM locally instead of loading from a CDN.

= 0.1.0 =
* Initial release: `.riv` block, media upload, WebGL2 runtime, editor preview, canvas size and accessible name.

== Privacy ==

This plugin:

* Registers the `.riv` MIME type and stores attachment IDs in block attributes like other media blocks.
* Loads the bundled **Rive WebGL2 JavaScript runtime** from your own site when the block is used (editor and front end).
* Does not collect analytics or call home.
