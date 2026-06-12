( function( wp ) {
	const { __ } = wp.i18n;
	const { registerBlockType } = wp.blocks;
	const { Fragment, createElement, useEffect, useRef, useState } = wp.element;
	const { InspectorControls, MediaUpload, MediaUploadCheck, useBlockProps } = wp.blockEditor;
	const { PanelBody, Button, TextControl, RangeControl } = wp.components;
	const { useSelect } = wp.data;

	const BLOCK_NAME = 'motion-player-rive/player';
	const MIME_RIVE = 'application/rive';

	function getAttachmentMime( media ) {
		if ( ! media ) {
			return '';
		}
		const m = media.mime || media.mime_type;
		return ( m || '' ).toLowerCase();
	}

	function isRiveMedia( media ) {
		if ( ! media ) {
			return false;
		}
		const mime = getAttachmentMime( media );
		if ( mime === MIME_RIVE ) {
			return true;
		}
		// Some installs store unknown binaries as octet-stream; allow if URL/name is .riv.
		if ( mime === 'application/octet-stream' ) {
			if ( media.url && /\.riv$/i.test( media.url.split( '?' )[ 0 ] ) ) {
				return true;
			}
			if ( media.filename && /\.riv$/i.test( media.filename ) ) {
				return true;
			}
			if ( typeof media.slug === 'string' && /\.riv$/i.test( media.slug ) ) {
				return true;
			}
		}
		if ( media.url && /\.riv$/i.test( media.url.split( '?' )[ 0 ] ) ) {
			return true;
		}
		if ( media.filename && /\.riv$/i.test( media.filename ) ) {
			return true;
		}
		if ( typeof media.slug === 'string' && /\.riv$/i.test( media.slug ) ) {
			return true;
		}
		return false;
	}

	function getMediaSrc( media ) {
		if ( ! media ) {
			return '';
		}
		if ( media.source_url ) {
			return media.source_url;
		}
		if ( media.url ) {
			return media.url;
		}
		return '';
	}

	function shouldAutoplayRive() {
		if ( typeof window === 'undefined' || ! window.matchMedia ) {
			return true;
		}
		return ! window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
	}

	/** Official UMD bundle sets window.rive (same as unpkg …/rive.js). */
	function getRivePackageFromGlobal() {
		const riv = typeof window !== 'undefined' ? window.rive : null;
		if ( ! riv ) {
			return { Rive: null, Layout: null, Fit: null, Alignment: null };
		}
		if (
			riv.default &&
			typeof riv.default === 'object' &&
			typeof riv.default.Rive === 'function'
		) {
			return {
				Rive: riv.default.Rive,
				Layout: riv.default.Layout,
				Fit: riv.default.Fit,
				Alignment: riv.default.Alignment,
			};
		}
		return {
			Rive: riv.Rive,
			Layout: riv.Layout,
			Fit: riv.Fit,
			Alignment: riv.Alignment,
		};
	}

	function MotionPlayerRiveEditorPreview( props ) {
		const { src, width, height, stateMachineName } = props;
		const canvasRef = useRef( null );
		const riveRef = useRef( null );
		const [ status, setStatus ] = useState( src ? 'loading' : 'idle' );

		useEffect(
			function() {
				if ( ! src ) {
					setStatus( 'idle' );
					return;
				}

				let cancelled = false;
				setStatus( 'loading' );

				const autoplay = shouldAutoplayRive();

				try {
					const { Rive, Layout, Fit, Alignment } = getRivePackageFromGlobal();
					if ( ! Rive || ! Layout || ! Fit || ! Alignment ) {
						throw new Error( 'window.rive missing (load @rive-app/webgl2/rive.js first)' );
					}
					if ( cancelled || ! canvasRef.current ) {
						return;
					}
					const canvas = canvasRef.current;
					if ( riveRef.current && typeof riveRef.current.cleanup === 'function' ) {
						riveRef.current.cleanup();
						riveRef.current = null;
					}
					canvas.width = width;
					canvas.height = height;
					canvas.style.backgroundColor = 'transparent';
					const layout = new Layout( {
						fit: Fit.Contain,
						alignment: Alignment.Center,
					} );
					const playback = window.motionPlayerRivePlayback;
					if ( ! playback || typeof playback.createInstance !== 'function' ) {
						throw new Error( 'motionPlayerRivePlayback is missing' );
					}
					const r = playback.createInstance( Rive, {
						src: src,
						canvas: canvas,
						layout: layout,
						autoplay: autoplay,
						stateMachineName: stateMachineName || '',
					} );
					riveRef.current = r;
					setStatus( 'ready' );
				} catch ( err ) {
					if ( ! cancelled ) {
						setStatus( 'error' );
						if ( typeof console !== 'undefined' && console.warn ) {
							console.warn( '[MotionPlayer Rive]', err );
						}
					}
				}

				return function() {
					cancelled = true;
					if ( riveRef.current && typeof riveRef.current.cleanup === 'function' ) {
						riveRef.current.cleanup();
					}
					riveRef.current = null;
				};
			},
			[ src, width, height, stateMachineName ]
		);

		return createElement(
			Fragment,
			null,
			status === 'loading' &&
				createElement(
					'p',
					{ className: 'motion-player-rive-editor__preview-status' },
					__( 'Loading preview…', 'motion-player-rive' )
				),
			status === 'error' &&
				createElement(
					'p',
					{ className: 'motion-player-rive-editor__preview-status' },
					__(
						'Could not load preview. Check your network or .riv file.',
						'motion-player-rive'
					)
				),
			! shouldAutoplayRive() &&
				status === 'ready' &&
				createElement(
					'p',
					{ className: 'motion-player-rive-editor__preview-status' },
					__( 'Reduced motion: preview is paused (first frame).', 'motion-player-rive' )
				),
			createElement(
				'div',
				{
					className: 'motion-player-rive-editor__frame',
					style: { maxWidth: width + 'px' },
				},
				createElement( 'canvas', {
					ref: canvasRef,
					className: 'motion-player-rive-editor__canvas motion-player-rive__canvas',
					width: width,
					height: height,
					style: { backgroundColor: 'transparent' },
					'aria-hidden': true,
				} )
			)
		);
	}

	registerBlockType( BLOCK_NAME, {
		edit: ( { attributes, setAttributes } ) => {
			const { rivAttachmentId, canvasWidth, canvasHeight, accessibleLabel, stateMachineName } = attributes;

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

			const previewReady =
				rivAttachmentId &&
				typeof media !== 'undefined' &&
				media !== null &&
				isRiveMedia( media );
			const previewSrc = previewReady ? getMediaSrc( media ) : '';

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
									const rawId = selected.id;
									const id =
										typeof rawId === 'string' ? parseInt( rawId, 10 ) : rawId;
									if ( ! id ) {
										return;
									}
									setAttributes( { rivAttachmentId: id } );
								},
								// Omit allowedTypes so uploads / library work when MIME varies; we validate in onSelect.
								value: rivAttachmentId > 0 ? rivAttachmentId : undefined,
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
						} ),
						createElement( TextControl, {
							label: __( 'State machine name (optional)', 'motion-player-rive' ),
							help: __(
								'Use when your .riv file is driven by a state machine. Leave empty to play the first state machine or animation found.',
								'motion-player-rive'
							),
							value: stateMachineName || '',
							onChange: function( v ) {
								setAttributes( { stateMachineName: v || '' } );
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
								previewSrc
									? createElement( MotionPlayerRiveEditorPreview, {
											src: previewSrc,
											width: canvasWidth,
											height: canvasHeight,
											stateMachineName: stateMachineName || '',
									  } )
									: createElement(
											'p',
											{ className: 'motion-player-rive-editor__note' },
											__( 'Loading file details…', 'motion-player-rive' )
									  )
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
