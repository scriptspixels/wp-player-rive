/**
 * Shared Rive instance setup: state-machine files need explicit playback (autoplay alone is not enough).
 */
( function() {
	'use strict';

	function resizeCanvas( rive ) {
		if ( rive && typeof rive.resizeDrawingSurfaceToCanvas === 'function' ) {
			rive.resizeDrawingSurfaceToCanvas();
		}
	}

	function drawFirstFrame( rive ) {
		if ( typeof rive.pause === 'function' ) {
			rive.pause();
		}
		if ( typeof rive.drawFrame === 'function' ) {
			rive.drawFrame();
		}
	}

	function startDefaultPlayback( rive, explicitStateMachine ) {
		if ( explicitStateMachine ) {
			rive.play( explicitStateMachine );
			return;
		}

		const stateMachines = rive.stateMachineNames;
		if ( stateMachines && stateMachines.length ) {
			rive.play( stateMachines.length === 1 ? stateMachines[ 0 ] : stateMachines );
			return;
		}

		const animations = rive.animationNames;
		if ( animations && animations.length ) {
			rive.play( animations.length === 1 ? animations[ 0 ] : animations );
		}
	}

	window.motionPlayerRivePlayback = {
		createInstance: function( Rive, opts ) {
			const autoplay = opts.autoplay !== false;
			const explicitSm = opts.stateMachineName || '';

			const rive = new Rive( {
				src: opts.src,
				canvas: opts.canvas,
				layout: opts.layout,
				autoplay: autoplay,
				stateMachines: explicitSm || undefined,
				onLoad: function() {
					if ( ! autoplay ) {
						drawFirstFrame( rive );
						resizeCanvas( rive );
						return;
					}
					const hasStateMachines =
						rive.stateMachineNames && rive.stateMachineNames.length > 0;
					if ( explicitSm || hasStateMachines ) {
						startDefaultPlayback( rive, explicitSm );
					} else if ( ! rive.isPlaying ) {
						startDefaultPlayback( rive, explicitSm );
					}
					resizeCanvas( rive );
				},
			} );

			resizeCanvas( rive );
			return rive;
		},
	};

} )();
