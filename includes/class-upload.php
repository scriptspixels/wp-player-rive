<?php
/**
 * Allow .riv uploads and a dedicated MIME type for the media library.
 *
 * @package Motion_Player_Rive
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Rive file upload support.
 */
class Motion_Player_Rive_Upload {
	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function init() {
		add_filter( 'upload_mimes', array( $this, 'upload_mimes' ) );
		add_filter( 'wp_check_filetype_and_ext', array( $this, 'fix_filetype' ), 10, 5 );
	}

	/**
	 * Register .riv with a specific MIME so the block editor can filter the media modal.
	 *
	 * @param array $mimes Allowed mime types keyed by extension.
	 * @return array
	 */
	public function upload_mimes( $mimes ) {
		$mimes['riv'] = 'application/rive';
		return $mimes;
	}

	/**
	 * Ensure .riv is accepted when core does not infer type from extension.
	 *
	 * @param array        $data     File data.
	 * @param string       $file     Full path to file.
	 * @param string       $filename File name.
	 * @param string[]|null $mimes   Mime types.
	 * @param string       $real_mime Discovered MIME.
	 * @return array
	 */
	public function fix_filetype( $data, $file, $filename, $mimes, $real_mime = '' ) {
		if ( ! empty( $data['ext'] ) && ! empty( $data['type'] ) ) {
			return $data;
		}

		$extension = strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) );
		if ( 'riv' !== $extension ) {
			return $data;
		}

		$data['ext']  = 'riv';
		$data['type'] = 'application/rive';

		return $data;
	}
}
