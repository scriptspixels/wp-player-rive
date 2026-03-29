/**
 * Front-end Rive player (ES module). Runtime loaded from jsDelivr; version from data-rive-version.
 */

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

function initContainer( el, Rive, Layout, Fit, Alignment ) {
	const src = el.getAttribute( 'data-rive-src' );
	const canvas = el.querySelector( 'canvas.motion-player-rive__canvas' );
	if ( ! src || ! canvas ) {
		return;
	}

	const fit = resolveFit( Fit, el.getAttribute( 'data-rive-fit' ) );
	const alignment = resolveAlignment( Alignment, el.getAttribute( 'data-rive-align' ) );
	const layout = new Layout( { fit, alignment } );

	const rive = new Rive( {
		src,
		canvas,
		layout,
		autoplay: true,
	} );

	if ( typeof rive.resizeDrawingSurfaceToCanvas === 'function' ) {
		rive.resizeDrawingSurfaceToCanvas();
	}
}

function initAll() {
	const nodes = document.querySelectorAll( '.motion-player-rive[data-rive-src]' );
	if ( ! nodes.length ) {
		return;
	}

	const version = nodes[ 0 ].getAttribute( 'data-rive-version' ) || '2.19.6';

	loadRiveModule( version ).then( ( mod ) => {
		const Rive = mod.Rive;
		const Layout = mod.Layout;
		const Fit = mod.Fit;
		const Alignment = mod.Alignment;
		nodes.forEach( function( el ) {
			try {
				initContainer( el, Rive, Layout, Fit, Alignment );
			} catch ( e ) {
				if ( typeof console !== 'undefined' && console.warn ) {
					console.warn( '[MotionPlayer Rive]', e );
				}
			}
		} );
	} );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initAll );
} else {
	initAll();
}
