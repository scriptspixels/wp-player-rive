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
		add_filter( 'upload_filetypes', array( $this, 'upload_filetypes' ) );
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
		$extension = strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) );
		if ( 'riv' !== $extension ) {
			return $data;
		}

		// Always normalize .riv so core does not leave octet-stream / empty ext on the attachment.
		$data['ext']  = 'riv';
		$data['type'] = 'application/rive';

		return $data;
	}

	/**
	 * Allow .riv on multisite (Network Settings → Upload file types).
	 *
	 * @param string $types Space-separated list of extensions without dots.
	 * @return string
	 */
	public function upload_filetypes( $types ) {
		$list = array_filter( array_map( 'trim', explode( ' ', (string) $types ) ) );
		if ( ! in_array( 'riv', $list, true ) ) {
			$types = trim( (string) $types . ' riv' );
		}
		return $types;
	}
}
