/**
 * Front-end Rive player. Uses the official @rive-app/webgl2 UMD bundle (window.rive) from unpkg —
 * same as loading rive.js directly; supports drop shadows, gradients, blend modes via Rive Renderer.
 */
( function() {
	'use strict';

	/** One Rive instance per block wrapper. */
	const containerInstances = new WeakMap();

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

	function resolveFit( Fit, token ) {
		const t = ( token || 'contain' ).toLowerCase();
		const map = {
			contain: Fit.Contain,
			cover: Fit.Cover,
			fill: Fit.Fill,
			fitwidth: Fit.FitWidth,
			fitheight: Fit.FitHeight,
			none: Fit.None,
			scaledown: Fit.ScaleDown,
		};
		return map[ t ] || Fit.Contain;
	}

	function resolveAlignment( Alignment, token ) {
		const t = ( token || 'center' ).toLowerCase();
		const map = {
			topleft: Alignment.TopLeft,
			topcenter: Alignment.TopCenter,
			topright: Alignment.TopRight,
			centerleft: Alignment.CenterLeft,
			center: Alignment.Center,
			centerright: Alignment.CenterRight,
			bottomleft: Alignment.BottomLeft,
			bottomcenter: Alignment.BottomCenter,
			bottomright: Alignment.BottomRight,
		};
		return map[ t ] || Alignment.Center;
	}

	function disposeContainer( el ) {
		const existing = containerInstances.get( el );
		if ( existing && typeof existing.cleanup === 'function' ) {
			try {
				existing.cleanup();
			} catch ( e ) {
				if ( typeof console !== 'undefined' && console.warn ) {
					console.warn( '[MotionPlayer Rive] cleanup', e );
				}
			}
		}
		containerInstances.delete( el );
	}

	function initContainer( el, Rive, Layout, Fit, Alignment ) {
		const src = el.getAttribute( 'data-rive-src' );
		const canvas =
			el.querySelector( ':scope > canvas.motion-player-rive__canvas' ) ||
			el.querySelector( 'canvas.motion-player-rive__canvas' );
		if ( ! src || ! canvas ) {
			return;
		}

		disposeContainer( el );

		canvas.style.backgroundColor = 'transparent';

		const fit = resolveFit( Fit, el.getAttribute( 'data-rive-fit' ) );
		const alignment = resolveAlignment( Alignment, el.getAttribute( 'data-rive-align' ) );
		const layout = new Layout( { fit, alignment } );

		const reduceMotion =
			typeof window !== 'undefined' &&
			window.matchMedia &&
			window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

		const playback = window.motionPlayerRivePlayback;
		if ( ! playback || typeof playback.createInstance !== 'function' ) {
			if ( typeof console !== 'undefined' && console.warn ) {
				console.warn( '[MotionPlayer Rive] rive-playback.js is missing.' );
			}
			return;
		}

		const stateMachineName = el.getAttribute( 'data-rive-state-machine' ) || '';

		const rive = playback.createInstance( Rive, {
			src,
			canvas,
			layout,
			autoplay: ! reduceMotion,
			stateMachineName,
		} );

		containerInstances.set( el, rive );
	}

	function initAll() {
		const pkg = getRivePackageFromGlobal();
		if ( ! pkg.Rive || ! pkg.Layout || ! pkg.Fit || ! pkg.Alignment ) {
			if ( typeof console !== 'undefined' && console.warn ) {
				console.warn(
					'[MotionPlayer Rive] window.rive is missing. Expected @rive-app/webgl2/rive.js before view.js.'
				);
			}
			return;
		}

		const nodes = Array.from(
			document.querySelectorAll( '.motion-player-rive[data-rive-src]' )
		);
		nodes.forEach( function( el ) {
			if ( ! el.isConnected ) {
				return;
			}
			try {
				initContainer( el, pkg.Rive, pkg.Layout, pkg.Fit, pkg.Alignment );
			} catch ( e ) {
				if ( typeof console !== 'undefined' && console.warn ) {
					console.warn( '[MotionPlayer Rive]', e );
				}
			}
		} );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initAll );
	} else {
		initAll();
	}
} )();
