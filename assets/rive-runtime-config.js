/**
 * Point the bundled Rive runtime at embedded WASM (must run before any Rive instance).
 */
( function() {
	'use strict';

	const wasmBinary =
		typeof window !== 'undefined' ? window.motionPlayerRiveWasmBinary : '';

	if ( ! wasmBinary ) {
		return;
	}

	const riv = typeof window !== 'undefined' ? window.rive : null;
	if ( ! riv ) {
		return;
	}

	const RuntimeLoader =
		riv.RuntimeLoader || ( riv.default && riv.default.RuntimeLoader );

	if ( ! RuntimeLoader || typeof RuntimeLoader.setWasmUrl !== 'function' ) {
		return;
	}

	const raw = atob( wasmBinary );
	const bytes = new Uint8Array( raw.length );
	for ( let i = 0; i < raw.length; i++ ) {
		bytes[ i ] = raw.charCodeAt( i );
	}

	const blob = new Blob( [ bytes ], { type: 'application/wasm' } );
	RuntimeLoader.setWasmUrl( URL.createObjectURL( blob ) );
} )();
