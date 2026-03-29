<?php
/**
 * Core plugin loader.
 *
 * @package Motion_Player_Rive
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Main plugin class.
 */
class Motion_Player_Rive_Plugin {
	/**
	 * Register subsystems.
	 *
	 * @return void
	 */
	public function init() {
		$upload = new Motion_Player_Rive_Upload();
		$upload->init();

		$block = new Motion_Player_Rive_Block();
		$block->init();
	}
}
