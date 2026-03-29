<?php
/**
 * Block registration and front-end render.
 *
 * @package Motion_Player_Rive
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Rive player block.
 */
class Motion_Player_Rive_Block {
	/**
	 * Rive Canvas runtime version (pinned for predictable behavior).
	 */
	const RIVE_RUNTIME_VERSION = '2.19.6';

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'init', array( $this, 'register_block' ) );
	}

	/**
	 * Register block type, editor script, and styles.
	 *
	 * @return void
	 */
	public function register_block() {
		$script_handle = 'motion-player-rive-block';

		wp_register_script(
			$script_handle,
			MOTION_PLAYER_RIVE_PLUGIN_URL . 'assets/block.js',
			array( 'wp-blocks', 'wp-element', 'wp-i18n', 'wp-components', 'wp-block-editor', 'wp-data' ),
			MOTION_PLAYER_RIVE_VERSION,
			true
		);

		wp_register_style(
			'motion-player-rive-style',
			MOTION_PLAYER_RIVE_PLUGIN_URL . 'assets/motion-player-rive.css',
			array(),
			MOTION_PLAYER_RIVE_VERSION
		);

		wp_register_style(
			'motion-player-rive-editor',
			MOTION_PLAYER_RIVE_PLUGIN_URL . 'assets/motion-player-rive-editor.css',
			array( 'wp-edit-blocks' ),
			MOTION_PLAYER_RIVE_VERSION
		);

		wp_register_script(
			'motion-player-rive-view',
			MOTION_PLAYER_RIVE_PLUGIN_URL . 'assets/view.js',
			array(),
			MOTION_PLAYER_RIVE_VERSION,
			true
		);
		wp_script_add_data( 'motion-player-rive-view', 'type', 'module' );

		register_block_type_from_metadata(
			MOTION_PLAYER_RIVE_PLUGIN_DIR . 'blocks/motion-player-rive',
			array(
				'editor_script'   => $script_handle,
				'render_callback' => array( $this, 'render_block' ),
			)
		);
	}

	/**
	 * Render block HTML and enqueue the Rive runtime (once per page).
	 *
	 * @param array         $attributes Block attributes.
	 * @param string        $content    Inner blocks content.
	 * @param WP_Block|null $block      Block instance.
	 * @return string
	 */
	public function render_block( $attributes, $content, $block = null ) {
		$attachment_id = isset( $attributes['rivAttachmentId'] ) ? absint( $attributes['rivAttachmentId'] ) : 0;
		if ( $attachment_id <= 0 ) {
			return '';
		}

		if ( ! $this->is_allowed_rive_attachment( $attachment_id ) ) {
			return '';
		}

		$url = wp_get_attachment_url( $attachment_id );
		if ( ! $url ) {
			return '';
		}

		$width  = isset( $attributes['canvasWidth'] ) ? absint( $attributes['canvasWidth'] ) : 400;
		$height = isset( $attributes['canvasHeight'] ) ? absint( $attributes['canvasHeight'] ) : 400;
		$width  = min( 2000, max( 50, $width ) );
		$height = min( 2000, max( 50, $height ) );

		$label = isset( $attributes['accessibleLabel'] ) && is_string( $attributes['accessibleLabel'] )
			? sanitize_text_field( $attributes['accessibleLabel'] )
			: '';
		if ( '' === $label ) {
			$label = get_the_title( $attachment_id );
		}
		if ( '' === $label ) {
			$label = __( 'Rive animation', 'motion-player-rive' );
		}

		wp_enqueue_script( 'motion-player-rive-view' );

		$extra_attrs = array(
			'class'             => 'motion-player-rive',
			'data-rive-src'     => $url,
			'data-rive-version' => self::RIVE_RUNTIME_VERSION,
			'style'             => sprintf( 'max-width:%dpx;', $width ),
			'data-rive-fit'     => 'contain',
			'data-rive-align'   => 'center',
		);

		global $wp_version;
		if ( $block instanceof WP_Block && version_compare( (string) $wp_version, '6.3', '>=' ) ) {
			$wrapper_attrs = get_block_wrapper_attributes( $extra_attrs, $block );
		} else {
			$wrapper_attrs = get_block_wrapper_attributes( $extra_attrs );
		}

		ob_start();
		?>
		<div <?php echo $wrapper_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<canvas
				class="motion-player-rive__canvas"
				width="<?php echo esc_attr( (string) $width ); ?>"
				height="<?php echo esc_attr( (string) $height ); ?>"
				role="img"
				aria-label="<?php echo esc_attr( $label ); ?>"
			></canvas>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * Whether the attachment is a Rive file we should serve to the runtime.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return bool
	 */
	private function is_allowed_rive_attachment( $attachment_id ) {
		$mime = get_post_mime_type( $attachment_id );
		if ( 'application/rive' === $mime ) {
			return true;
		}
		$file = get_attached_file( $attachment_id );
		if ( ! $file ) {
			return false;
		}
		$ext = strtolower( pathinfo( $file, PATHINFO_EXTENSION ) );
		return 'riv' === $ext;
	}
}
