<?php
/**
 * Plugin Name: MotionPlayer for Rive
 * Description: Embed Rive (.riv) animations with a block. Free version: upload or pick a file from the media library.
 * Version: 0.1.0
 * Author: Scripts + Pixels
 * Author URI: https://scriptsandpixels.studio
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: motion-player-rive
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 7.4
 *
 * @package Motion_Player_Rive
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MOTION_PLAYER_RIVE_VERSION', '0.1.0' );
define( 'MOTION_PLAYER_RIVE_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'MOTION_PLAYER_RIVE_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'MOTION_PLAYER_RIVE_PLUGIN_FILE', __FILE__ );

require_once MOTION_PLAYER_RIVE_PLUGIN_DIR . 'includes/class-plugin.php';
require_once MOTION_PLAYER_RIVE_PLUGIN_DIR . 'includes/class-upload.php';
require_once MOTION_PLAYER_RIVE_PLUGIN_DIR . 'includes/class-block.php';

/**
 * Bootstrap the plugin.
 *
 * @return void
 */
function motion_player_rive_init() {
	$plugin = new Motion_Player_Rive_Plugin();
	$plugin->init();
}
add_action( 'plugins_loaded', 'motion_player_rive_init', 10 );
