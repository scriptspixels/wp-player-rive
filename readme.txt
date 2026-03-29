=== MotionPlayer for Rive ===
Contributors: scriptsandpixels
Tags: rive, animation, block, media
Requires at least: 6.0
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embed Rive (.riv) animations with a block. Pick a file from the media library; the animation plays on the front end.

== Description ==

MotionPlayer for Rive adds a **MotionPlayer: Rive** block. The free version lets you upload or select a `.riv` file and set canvas dimensions and an optional accessible name. The Rive Canvas runtime loads on the front end when the block is present.

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/` or install the zip from the Plugins screen.
2. Activate **MotionPlayer for Rive** through the **Plugins** menu.
3. Add the **MotionPlayer: Rive** block and choose a `.riv` file.

== Frequently Asked Questions ==

= Does this work in the block editor only? =

Yes. The block is registered for the block editor.

= Where does the Rive runtime load from? =

The front end loads `@rive-app/canvas` from jsDelivr when a page contains the block.

== Changelog ==

= 0.1.0 =
* Initial release: Rive block, media upload, basic canvas size and accessibility label.
