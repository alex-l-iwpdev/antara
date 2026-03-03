<?php
/**
 * GeoContent Module class file.
 *
 * @package iwpdev/antara
 */


namespace Iwpdev\Antara\Modules;

use Iwpdev\Antara\Api\GeoIpApi;

/**
 * GeoContent Module.
 */
class GeoContent {

	/**
	 * GeoContent action and nonce.
	 */
	const GEO_CONTENT_ACTION_AND_NONCE = 'geo_content';

	/**
	 * GeoContent constructor.
	 */
	public function __construct() {
		add_filter( 'manage_geo-content_posts_columns', [ $this, 'add_shortcode_column' ] );
		add_action( 'manage_geo-content_posts_custom_column', [ $this, 'render_shortcode_column' ], 10, 2 );

		add_shortcode( 'geo_content', [ $this, 'render_shortcode' ] );

		add_action( 'wp_ajax_' . self::GEO_CONTENT_ACTION_AND_NONCE, [ $this, 'get_geo_content' ] );
		add_action( 'wp_ajax_nopriv_' . self::GEO_CONTENT_ACTION_AND_NONCE, [ $this, 'get_geo_content' ] );
	}

	/**
	 * Add shortcode column to geo-content post type.
	 *
	 * @param array $columns Columns.
	 *
	 * @return array
	 */
	public function add_shortcode_column( array $columns ): array {
		$columns['geo_shortcode'] = esc_html__( 'Shortcode', 'bricks' );

		return $columns;
	}

	/**
	 * Render shortcode column content.
	 *
	 * @param string $column  Column name.
	 * @param int    $post_id Post ID.
	 *
	 * @return void
	 */
	public function render_shortcode_column( string $column, int $post_id ): void {
		if ( 'geo_shortcode' === $column ) {
			printf( '<code>[geo_content id=%d]</code>', (int) $post_id );
		}
	}

	/**
	 * Render shortcode
	 *
	 * @param $atts
	 *
	 * @return string
	 */
	public function render_shortcode( $atts ): string {

		return '<div class="geo-content-shortcode" data-id="' . $atts['id'] . '"></div>';
	}

	/**
	 * Handles the retrieval of geo-content via an AJAX request.
	 *
	 * @return void
	 */
	public function get_geo_content(): void {
		$nonce = ! empty( $_POST['nonce'] ) ? filter_var( wp_unslash( $_POST['nonce'] ), FILTER_SANITIZE_FULL_SPECIAL_CHARS ) : '';
		if ( ! wp_verify_nonce( $nonce, self::GEO_CONTENT_ACTION_AND_NONCE ) ) {
			wp_send_json_error(
				[
					'message' => 'Invalid nonce',
				]
			);
		}

		$ids = ! empty( $_POST['ids'] ) ? filter_var_array( $_POST['ids'], FILTER_VALIDATE_INT ) : '';

		if ( empty( $ids ) ) {
			wp_send_json_error(
				[
					'message' => 'Invalid ids',
				]
			);
		}

		$geo_api = new GeoIpApi();
		$ip      = $_SERVER['REMOTE_ADDR'] ?? $_SERVER['HTTP_X_REAL_IP'];
		if(isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
			$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
		}

		error_log( 'IP: ' . $ip );
		error_log( print_r($_SERVER, true) );

		$country       = $geo_api->get_geo_info( $ip );
		error_log( 'Country: ' . $country );
		$country       = strtoupper( $country ?: 'default' );
		$content_array = [];
		foreach ( $ids as $id ) {
			$content = get_fields( $id, 'geo_content' );

			// Check if field is a group with a 'contents' repeater.
			if ( isset( $content['contents'] ) && is_array( $content['contents'] ) ) {
				$content = $content['contents'];
			}

			if ( ! empty( $content ) && is_array( $content ) ) {
				$matched_content = null;
				$default_content = null;

				foreach ( $content as $item ) {

					$item_country = $item['country'];
					if ( $item_country === $country ) {
						$matched_content = $item['content'];
						break;
					}

					if ( $item_country === 'default' ) {
						$default_content = $item['content'];
					}

				}

				$final_content = $matched_content ?? $default_content;

				if ( null !== $final_content ) {
					$content_array[] = [
						'id'      => (int) $id,
						'content' => $final_content,
					];
				}
			}
		}

		wp_send_json_success( $content_array );
	}

}
