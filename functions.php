<?php
/**
 * Bricks Child Theme.
 *
 * @package iwpdev/antara
 */

/**
 * Add parent theme styles.
 */
add_action(
	'wp_enqueue_scripts',
	function () {
		// Code & check below enqueues your files on the canvas & frontend, not the builder panel. Otherwise custom CSS might affect builder)
		if ( ! bricks_is_builder_main() ) {
			wp_enqueue_style( 'bricks-child', get_stylesheet_uri(), [ 'bricks-frontend' ], filemtime( get_stylesheet_directory() . '/style.css' ) );
		}
	}
);
