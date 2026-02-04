<?php
/**
 * Main theme class file.
 *
 * @package iwpdev/antara
 */

namespace Iwpdev\Antara;

/**
 * Main theme class.
 */
class Main {
	/**
	 * Theme version.
	 */
	const THEME_VERSION = '1.0.0';

	/**
	 * Mail constructor.
	 */
	public function __construct() {
		$this->init();
	}

	/**
	 * Init Actions and Filters.
	 *
	 * @return void
	 */
	private function init(): void {
		add_action( 'wp_enqueue_scripts', [ $this, 'register_scripts_and_styles' ] );
	}

	/**
	 * Register scripts and styles.
	 *
	 * @return void
	 */
	public function register_scripts_and_styles(): void {

		wp_enqueue_script(
			'bricks-child-app',
			get_stylesheet_directory_uri() . '/assets/js/app.js',
			[
				'bricks-frontend',
				'jquery',
			],
			self::THEME_VERSION,
			true
		);

		wp_enqueue_style( 'bricks-child-style', get_stylesheet_directory_uri() . '/assets/css/app.css', [ 'bricks-frontend' ] );
	}

}
