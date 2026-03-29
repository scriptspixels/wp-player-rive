( function( wp ) {
	const { __ } = wp.i18n;
	const { registerBlockType } = wp.blocks;
	const { Fragment, createElement, useEffect } = wp.element;
	const { InspectorControls, MediaUpload, MediaUploadCheck, useBlockProps } = wp.blockEditor;
	const { PanelBody, Button, TextControl, RangeControl } = wp.components;
	const { useSelect } = wp.data;

	const BLOCK_NAME = 'motion-player-rive/player';
	const MIME_RIVE = 'application/rive';

	function isRiveMedia( media ) {
		if ( ! media ) {
			return false;
		}
		if ( media.mime === MIME_RIVE ) {
			return true;
		}
		if ( media.url && /\.riv$/i.test( media.url.split( '?' )[ 0 ] ) ) {
			return true;
		}
		if ( media.filename && /\.riv$/i.test( media.filename ) ) {
			return true;
		}
		return false;
	}

	registerBlockType( BLOCK_NAME, {
		edit: ( { attributes, setAttributes } ) => {
			const { rivAttachmentId, canvasWidth, canvasHeight, accessibleLabel } = attributes;

			const media = useSelect(
				function( select ) {
					if ( ! rivAttachmentId ) {
						return null;
					}
					return select( 'core' ).getMedia( rivAttachmentId );
				},
				[ rivAttachmentId ]
			);

			useEffect(
				function() {
					if ( ! rivAttachmentId ) {
						return;
					}
					if ( typeof media === 'undefined' ) {
						return;
					}
					if ( media === null ) {
						setAttributes( { rivAttachmentId: 0 } );
						return;
					}
					if ( ! isRiveMedia( media ) ) {
						setAttributes( { rivAttachmentId: 0 } );
						wp.data.dispatch( 'core/notices' ).createNotice(
							'error',
							__( 'Please choose a .riv file.', 'motion-player-rive' ),
							{ type: 'snackbar', id: 'motion-player-rive-bad-type' }
						);
					}
				},
				[ media, rivAttachmentId ]
			);

			const blockProps = useBlockProps( { className: 'motion-player-rive-editor' } );

			const title =
				( media && media.title && media.title.rendered ) ||
				( media && media.slug ) ||
				'';

			return createElement(
				Fragment,
				null,
				createElement(
					InspectorControls,
					null,
					createElement(
						PanelBody,
						{ title: __( 'Rive file', 'motion-player-rive' ), initialOpen: true },
						createElement(
							MediaUploadCheck,
							null,
							createElement( MediaUpload, {
								onSelect: function( selected ) {
									if ( ! selected || ! isRiveMedia( selected ) ) {
										wp.data.dispatch( 'core/notices' ).createNotice(
											'error',
											__( 'Please choose a .riv file.', 'motion-player-rive' ),
											{ type: 'snackbar', id: 'motion-player-rive-bad-type' }
										);
										return;
									}
									setAttributes( { rivAttachmentId: selected.id } );
								},
								allowedTypes: [ MIME_RIVE ],
								value: rivAttachmentId || 0,
								render: function( { open } ) {
									return createElement(
										'div',
										{ className: 'motion-player-rive-editor__media' },
										createElement(
											Button,
											{ isPrimary: true, onClick: open },
											rivAttachmentId
												? __( 'Replace .riv file', 'motion-player-rive' )
												: __( 'Upload or select .riv file', 'motion-player-rive' )
										),
										rivAttachmentId
											? createElement(
													Button,
													{
														isLink: true,
														isDestructive: true,
														onClick: function() {
															setAttributes( { rivAttachmentId: 0 } );
														},
													},
													__( 'Remove', 'motion-player-rive' )
											  )
											: null
									);
								},
							} )
						)
					),
					createElement(
						PanelBody,
						{ title: __( 'Canvas', 'motion-player-rive' ), initialOpen: true },
						createElement( RangeControl, {
							label: __( 'Width (px)', 'motion-player-rive' ),
							value: canvasWidth,
							onChange: function( v ) {
								setAttributes( { canvasWidth: v } );
							},
							min: 50,
							max: 2000,
							step: 1,
						} ),
						createElement( RangeControl, {
							label: __( 'Height (px)', 'motion-player-rive' ),
							value: canvasHeight,
							onChange: function( v ) {
								setAttributes( { canvasHeight: v } );
							},
							min: 50,
							max: 2000,
							step: 1,
						} ),
						createElement( TextControl, {
							label: __( 'Accessible name (optional)', 'motion-player-rive' ),
							help: __(
								'Describe the animation for screen readers. Leave empty to use the media title.',
								'motion-player-rive'
							),
							value: accessibleLabel || '',
							onChange: function( v ) {
								setAttributes( { accessibleLabel: v || '' } );
							},
						} )
					)
				),
				createElement(
					'div',
					blockProps,
					rivAttachmentId
						? createElement(
								Fragment,
								null,
								createElement(
									'div',
									{ className: 'motion-player-rive-editor__preview-hint' },
									createElement(
										'strong',
										null,
										__( 'Rive file', 'motion-player-rive' )
									),
									': ',
									title || '#' + rivAttachmentId
								),
								createElement(
									'p',
									{ className: 'motion-player-rive-editor__note' },
									__( 'Animation plays on the front end.', 'motion-player-rive' )
								),
								createElement( 'div', {
									className: 'motion-player-rive-editor__frame',
									style: {
										maxWidth: canvasWidth + 'px',
										aspectRatio: canvasWidth + ' / ' + canvasHeight,
									},
								} )
						  )
						: createElement(
								'p',
								{ className: 'motion-player-rive-editor__empty' },
								__( 'Upload or select a .riv file from the media library.', 'motion-player-rive' )
						  )
				)
			);
		},
		save: function() {
			return null;
		},
	} );
} )( window.wp );
