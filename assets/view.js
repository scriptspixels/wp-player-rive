/**
 * Front-end Rive player (ES module). Runtime loaded from jsDelivr; version from data-rive-version.
 * Each block wrapper owns one Rive instance; re-init and duplicate script runs clean up safely.
 */

/** One Rive instance per block wrapper (survives duplicate inits; cleaned on re-run). */
const containerInstances = new WeakMap();

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

async function loadRiveModule( version ) {
	const v = version && /^[\d.]+$/.test( version ) ? version : '2.19.6';
	const url = `https://cdn.jsdelivr.net/npm/@rive-app/canvas@${v}/+esm`;
	return import( /* @vite-ignore */ url );
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
	const canvas = el.querySelector( ':scope > canvas.motion-player-rive__canvas' );
	if ( ! src || ! canvas ) {
		return;
	}

	disposeContainer( el );

	const fit = resolveFit( Fit, el.getAttribute( 'data-rive-fit' ) );
	const alignment = resolveAlignment( Alignment, el.getAttribute( 'data-rive-align' ) );
	const layout = new Layout( { fit, alignment } );

	const reduceMotion =
		typeof window !== 'undefined' &&
		window.matchMedia &&
		window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	const rive = new Rive( {
		src,
		canvas,
		layout,
		autoplay: ! reduceMotion,
	} );

	containerInstances.set( el, rive );

	if ( typeof rive.resizeDrawingSurfaceToCanvas === 'function' ) {
		rive.resizeDrawingSurfaceToCanvas();
	}
}

function groupNodesByVersion( nodes ) {
	const byVersion = new Map();
	nodes.forEach( function( el ) {
		const v = el.getAttribute( 'data-rive-version' ) || '2.19.6';
		if ( ! byVersion.has( v ) ) {
			byVersion.set( v, [] );
		}
		byVersion.get( v ).push( el );
	} );
	return byVersion;
}

function initAll() {
	const nodes = Array.from( document.querySelectorAll( '.motion-player-rive[data-rive-src]' ) );
	if ( ! nodes.length ) {
		return;
	}

	const byVersion = groupNodesByVersion( nodes );

	byVersion.forEach( function( elements, version ) {
		loadRiveModule( version )
			.then( function( mod ) {
				const Rive = mod.Rive;
				const Layout = mod.Layout;
				const Fit = mod.Fit;
				const Alignment = mod.Alignment;
				elements.forEach( function( el ) {
					if ( ! el.isConnected ) {
						return;
					}
					try {
						initContainer( el, Rive, Layout, Fit, Alignment );
					} catch ( e ) {
						if ( typeof console !== 'undefined' && console.warn ) {
							console.warn( '[MotionPlayer Rive]', e );
						}
					}
				} );
			} )
			.catch( function( err ) {
				if ( typeof console !== 'undefined' && console.warn ) {
					console.warn( '[MotionPlayer Rive] Failed to load runtime', version, err );
				}
			} );
	} );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initAll );
} else {
	initAll();
}
