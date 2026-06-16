/**
 * Point the bundled Rive runtime at locally shipped WASM (must run before any Rive instance).
 */
( function() {
	'use strict';

	const config = typeof window !== 'undefined' ? window.motionPlayerRiveConfig : null;
	if ( ! config || ! config.wasmUrl ) {
		return;
	}

	const riv = typeof window !== 'undefined' ? window.rive : null;
	if ( ! riv ) {
		return;
	}

	const RuntimeLoader =
		riv.RuntimeLoader || ( riv.default && riv.default.RuntimeLoader );

	if ( RuntimeLoader && typeof RuntimeLoader.setWasmUrl === 'function' ) {
		RuntimeLoader.setWasmUrl( config.wasmUrl );
	}
} )();
